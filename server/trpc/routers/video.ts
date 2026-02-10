import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { createImageToVideo, getTaskStatus } from "@/server/kling/client";
import { resolveContentPolicy } from "@/server/services/content-policy";
import { CREDIT_COSTS } from "@/lib/constants";
import { persistVideoToStorage } from "@/server/services/video-persist";
import { after } from "next/server";
import { logServerEvent } from "@/server/services/events";

export const videoRouter = router({
  // Generate a video from an image
  generate: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        prompt: z.string().max(1000).optional(),
        negativePrompt: z.string().max(500).optional(),
        duration: z.enum(["5", "10"]).default("5"),
        mode: z.enum(["standard", "professional"]).default("standard"),
        deviceKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Check credits
      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("credits_balance, subscription_plan, country_code, device_key")
        .eq("id", ctx.user.id)
        .single();

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const duration = parseInt(input.duration) as 5 | 10;
      const creditCost =
        CREDIT_COSTS[input.mode][duration];

      // 2. Resolve content policy
      const contentPolicy = await resolveContentPolicy({
        userId: ctx.user.id,
        deviceKey: input.deviceKey || profile.device_key || undefined,
        countryCode: profile.country_code,
      });

      // 3. Atomic credit deduction (checks balance + deducts in one operation)
      const { error: deductError } = await ctx.adminSupabase.rpc(
        "deduct_credits",
        { p_user_id: ctx.user.id, p_amount: creditCost }
      );

      if (deductError) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient credits",
        });
      }

      // 4. Create video record
      const { data: video, error: videoError } = await ctx.supabase
        .from("videos")
        .insert({
          user_id: ctx.user.id,
          input_image_url: input.imageUrl,
          prompt: input.prompt || null,
          duration,
          mode: input.mode,
          credits_consumed: creditCost,
          status: "pending",
          metadata: { content_policy: contentPolicy },
        })
        .select()
        .single();

      if (videoError || !video) {
        // Refund credits atomically
        await ctx.adminSupabase.rpc("refund_credits", {
          p_user_id: ctx.user.id,
          p_amount: creditCost,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create video record",
        });
      }

      // 5. Record credit transaction (use admin to bypass RLS)
      await ctx.adminSupabase.from("credit_transactions").insert({
        user_id: ctx.user.id,
        amount: -creditCost,
        type: "deduction",
        description: `Video generation: ${input.mode} ${duration}s`,
        video_id: video.id,
      });

      // 6. Call Kling API
      try {
        const klingResponse = await createImageToVideo({
          imageUrl: input.imageUrl,
          prompt: input.prompt,
          negativePrompt: input.negativePrompt,
          duration,
          mode: input.mode,
        });

        // Update video with Kling task ID
        await ctx.supabase
          .from("videos")
          .update({
            kling_task_id: klingResponse.data.task_id,
            status: "generating",
          })
          .eq("id", video.id);

        return {
          videoId: video.id,
          taskId: klingResponse.data.task_id,
          status: "generating",
        };
      } catch (err) {
        logServerEvent("video_generate_fail", {
          userId: ctx.user.id,
          metadata: { videoId: video.id, mode: input.mode, duration, error: err instanceof Error ? err.message : "Unknown" },
        });

        // Mark as failed, refund credits atomically
        await ctx.supabase
          .from("videos")
          .update({ status: "failed" })
          .eq("id", video.id);

        await ctx.adminSupabase.rpc("refund_credits", {
          p_user_id: ctx.user.id,
          p_amount: creditCost,
        });

        await ctx.supabase
          .from("credit_transactions")
          .delete()
          .eq("video_id", video.id);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start video generation",
        });
      }
    }),

  // Poll video status
  getStatus: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: video } = await ctx.supabase
        .from("videos")
        .select("*")
        .eq("id", input.videoId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // If still generating, poll Kling API
      if (
        video.status === "generating" &&
        video.kling_task_id
      ) {
        try {
          const taskResult = await getTaskStatus(video.kling_task_id);
          const klingStatus = taskResult.data.task_status;

          if (klingStatus === "succeed" && taskResult.data.task_result?.videos?.[0]) {
            const videoUrl = taskResult.data.task_result.videos[0].url;
            await ctx.supabase
              .from("videos")
              .update({
                status: "completed",
                output_video_url: videoUrl,
                kling_video_url: videoUrl,
                completed_at: new Date().toISOString(),
              })
              .eq("id", video.id);

            // Persist to Supabase Storage after response is sent
            after(() => persistVideoToStorage(video.id, videoUrl));

            return { ...video, status: "completed", output_video_url: videoUrl };
          }

          if (klingStatus === "failed") {
            await ctx.supabase
              .from("videos")
              .update({ status: "failed" })
              .eq("id", video.id);
            return { ...video, status: "failed" };
          }
        } catch {
          // Polling error — just return current status
        }
      }

      return video;
    }),

  // List user's videos
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error, count } = await ctx.supabase
        .from("videos")
        .select("*", { count: "exact" })
        .eq("user_id", ctx.user.id)
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) throw error;

      const videos = data || [];

      // Batch-update any still-generating videos by polling Kling
      const generating = videos.filter(
        (v) => v.status === "generating" && v.kling_task_id
      );

      if (generating.length > 0) {
        await Promise.allSettled(
          generating.map(async (v) => {
            try {
              const taskResult = await getTaskStatus(v.kling_task_id!);
              const klingStatus = taskResult.data.task_status;

              if (klingStatus === "succeed" && taskResult.data.task_result?.videos?.[0]) {
                const videoUrl = taskResult.data.task_result.videos[0].url;
                await ctx.supabase
                  .from("videos")
                  .update({
                    status: "completed",
                    output_video_url: videoUrl,
                    kling_video_url: videoUrl,
                    completed_at: new Date().toISOString(),
                  })
                  .eq("id", v.id);

                // Persist to Supabase Storage after response is sent
                after(() => persistVideoToStorage(v.id, videoUrl));

                v.status = "completed";
                v.output_video_url = videoUrl;
              } else if (klingStatus === "failed") {
                await ctx.supabase
                  .from("videos")
                  .update({ status: "failed" })
                  .eq("id", v.id);
                v.status = "failed";
              }
            } catch {
              // Polling error — skip, return stale status
            }
          })
        );
      }

      return { videos, total: count || 0 };
    }),

  // List public videos for Explorer page
  explore: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, count } = await ctx.supabase
        .from("videos")
        .select("id, output_video_url, prompt, created_at, aspect_ratio", {
          count: "exact",
        })
        .eq("is_public", true)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      return { videos: data || [], total: count || 0 };
    }),

  // Delete a video
  delete: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: video } = await ctx.supabase
        .from("videos")
        .select("id, user_id")
        .eq("id", input.videoId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      // Delete associated credit transactions (use admin to bypass RLS)
      await ctx.adminSupabase
        .from("credit_transactions")
        .delete()
        .eq("video_id", video.id);

      // Delete the video record (use admin to bypass FK issues)
      const { error } = await ctx.adminSupabase
        .from("videos")
        .delete()
        .eq("id", video.id)
        .eq("user_id", ctx.user.id); // still enforce ownership

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete video" });
      }

      return { success: true };
    }),
});
