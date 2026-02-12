import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { createImageToVideo, getTaskStatus } from "@/server/kling/client";
import { resolveContentPolicy } from "@/server/services/content-policy";
import { CREDIT_COSTS, PLANS } from "@/lib/constants";
import { persistVideoToStorage } from "@/server/services/video-persist";
import { after } from "next/server";
import { logServerEvent } from "@/server/services/events";
import { trackTikTokCAPIVideoGenerate } from "@/server/services/tiktok-capi";
import { trackFacebookCAPIVideoGenerate } from "@/server/services/facebook-capi";
import { checkImageSafety } from "@/server/services/image-safety";

const MAX_CONCURRENT: Record<string, number> = {
  free: PLANS.free.max_concurrent,
  pro: PLANS.pro.max_concurrent,
  premium: PLANS.premium.max_concurrent,
};

export const videoRouter = router({
  // Generate a video from an image
  generate: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        prompt: z.string().max(1000).optional(),
        negativePrompt: z.string().max(500).optional(),
        duration: z.enum(["5", "10"]).default("5"),
        mode: z.enum(["silent", "audio"]).default("silent"),
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

      // 1b. Enforce per-user concurrent generation limit
      const plan = profile.subscription_plan ?? "free";
      const maxConcurrent = MAX_CONCURRENT[plan] ?? MAX_CONCURRENT.free;
      const { count: activeCount } = await ctx.supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.user.id)
        .in("status", ["pending", "generating"]);

      if ((activeCount ?? 0) >= maxConcurrent) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `You can generate up to ${maxConcurrent} video${maxConcurrent === 1 ? "" : "s"} at a time. Please wait for current generations to finish.`,
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

      // 2b. Image safety check — block images containing minors
      const safetyResult = await checkImageSafety(
        input.imageUrl,
        ctx.user.id
      );

      if (!safetyResult.safe) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This image cannot be used because of safety reason. Please change to another image.",
        });
      }

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

      // 4b. Post-insert concurrent check (prevent TOCTOU race)
      // Now that our video exists in DB, re-check the real count.
      const { count: postInsertCount } = await ctx.supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.user.id)
        .in("status", ["pending", "generating"]);

      if ((postInsertCount ?? 0) > maxConcurrent) {
        // Another request sneaked past the pre-check — undo this one
        await ctx.supabase
          .from("videos")
          .delete()
          .eq("id", video.id);
        await ctx.adminSupabase.rpc("refund_credits", {
          p_user_id: ctx.user.id,
          p_amount: creditCost,
        });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `You can generate up to ${maxConcurrent} video${maxConcurrent === 1 ? "" : "s"} at a time. Please wait for current generations to finish.`,
        });
      }

      // 5. Record credit transaction (use admin to bypass RLS)
      await ctx.adminSupabase.from("credit_transactions").insert({
        user_id: ctx.user.id,
        amount: -creditCost,
        type: "deduction",
        description: `Video generation: ${input.mode === "audio" ? "with audio" : "silent"} ${duration}s`,
        video_id: video.id,
      });

      // 6. Call Kling API
      try {
        const klingResponse = await createImageToVideo({
          imageUrl: input.imageUrl,
          prompt: input.prompt,
          negativePrompt: input.negativePrompt,
          duration,
          sound: input.mode === "audio",
        });

        // Update video with Kling task ID
        await ctx.supabase
          .from("videos")
          .update({
            kling_task_id: klingResponse.data.task_id,
            status: "generating",
          })
          .eq("id", video.id);

        // CAPI: track video generation server-side (fire-and-forget)
        const eventId = `video_${video.id}`;
        trackTikTokCAPIVideoGenerate({
          userId: ctx.user.id,
          email: ctx.user.email || undefined,
          userAgent: ctx.userAgent,
          ip: ctx.ip,
          eventId,
          metadata: { mode: input.mode, duration, credits: creditCost },
        }).catch((e: unknown) => console.error("[video:generate] TikTok CAPI error:", e));

        trackFacebookCAPIVideoGenerate({
          userId: ctx.user.id,
          email: ctx.user.email || undefined,
          userAgent: ctx.userAgent,
          ip: ctx.ip,
          eventId,
          metadata: { mode: input.mode, duration, credits: creditCost },
        }).catch((e: unknown) => console.error("[video:generate] Facebook CAPI error:", e));

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

        await ctx.adminSupabase
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
            // Optimistic lock: only update if still generating
            const { data: updated } = await ctx.supabase
              .from("videos")
              .update({
                status: "completed",
                output_video_url: videoUrl,
                kling_video_url: videoUrl,
                completed_at: new Date().toISOString(),
              })
              .eq("id", video.id)
              .eq("status", "generating")
              .select("id")
              .single();

            if (updated) {
              after(() => persistVideoToStorage(video.id, videoUrl));
            }

            return { ...video, status: "completed", output_video_url: videoUrl };
          }

          if (klingStatus === "failed") {
            const { data: failUpdated } = await ctx.supabase
              .from("videos")
              .update({ status: "failed" })
              .eq("id", video.id)
              .eq("status", "generating")
              .select("id")
              .single();

            if (failUpdated) {
              await ctx.adminSupabase.rpc("refund_credits", {
                p_user_id: ctx.user.id,
                p_amount: video.credits_consumed,
              });
              await ctx.adminSupabase.from("credit_transactions").insert({
                user_id: ctx.user.id,
                amount: video.credits_consumed,
                type: "refund",
                description: "Refund: video generation failed",
                video_id: video.id,
              });
            }

            return { ...video, status: "failed" };
          }
        } catch (err) {
          console.error(`[video.getStatus] Polling failed for video=${video.id} task=${video.kling_task_id}:`, err instanceof Error ? err.message : err);
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
                // Optimistic lock: only update if still generating
                const { data: updated } = await ctx.supabase
                  .from("videos")
                  .update({
                    status: "completed",
                    output_video_url: videoUrl,
                    kling_video_url: videoUrl,
                    completed_at: new Date().toISOString(),
                  })
                  .eq("id", v.id)
                  .eq("status", "generating")
                  .select("id")
                  .single();

                if (updated) {
                  after(() => persistVideoToStorage(v.id, videoUrl));
                }

                v.status = "completed";
                v.output_video_url = videoUrl;
              } else if (klingStatus === "failed") {
                const { data: failUpdated } = await ctx.supabase
                  .from("videos")
                  .update({ status: "failed" })
                  .eq("id", v.id)
                  .eq("status", "generating")
                  .select("id")
                  .single();

                if (failUpdated) {
                  await ctx.adminSupabase.rpc("refund_credits", {
                    p_user_id: ctx.user.id,
                    p_amount: v.credits_consumed,
                  });
                  await ctx.adminSupabase.from("credit_transactions").insert({
                    user_id: ctx.user.id,
                    amount: v.credits_consumed,
                    type: "refund",
                    description: "Refund: video generation failed",
                    video_id: v.id,
                  });
                }

                v.status = "failed";
              }
            } catch (err) {
              console.error(`[video.list] Polling failed for video=${v.id} task=${v.kling_task_id}:`, err instanceof Error ? err.message : err);
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

  // Mark video as downloaded (first download only)
  markDownloaded: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("videos")
        .update({ downloaded_at: new Date().toISOString() })
        .eq("id", input.videoId)
        .eq("user_id", ctx.user.id)
        .is("downloaded_at", null);

      return { success: true };
    }),

  // Delete a video
  delete: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: video } = await ctx.supabase
        .from("videos")
        .select("id, user_id, status, credits_consumed")
        .eq("id", input.videoId)
        .eq("user_id", ctx.user.id)
        .single();

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      // Block deletion of in-progress videos (credits already committed to Kling)
      if (video.status === "pending" || video.status === "generating") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete a video that is still generating. Please wait for it to finish.",
        });
      }

      // Nullify the video_id reference on credit transactions (preserve audit trail)
      await ctx.adminSupabase
        .from("credit_transactions")
        .update({ video_id: null })
        .eq("video_id", video.id);

      // Delete the video record
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
