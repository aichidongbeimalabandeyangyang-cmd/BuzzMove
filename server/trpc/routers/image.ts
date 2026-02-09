import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const imageRouter = router({
  // List user's uploaded images (pinned first, then newest)
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Try with is_pinned first; fall back if column doesn't exist yet
      const { data, error } = await ctx.supabase
        .from("image_uploads")
        .select("id, url, filename, is_pinned, created_at")
        .eq("user_id", ctx.user.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error && error.message?.includes("is_pinned")) {
        const { data: fallback, error: fallbackErr } = await ctx.supabase
          .from("image_uploads")
          .select("id, url, filename, created_at")
          .eq("user_id", ctx.user.id)
          .order("created_at", { ascending: false })
          .limit(input.limit);
        if (fallbackErr) throw fallbackErr;
        return (fallback || []).map((p) => ({ ...p, is_pinned: false }));
      }

      if (error) throw error;
      return data || [];
    }),

  // Delete an uploaded image
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("image_uploads")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)
        .select("id")
        .single();

      if (error || !data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Image not found" });
      }

      return { success: true };
    }),

  // Toggle pin/unpin an image (requires is_pinned column migration)
  togglePin: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: image } = await ctx.supabase
        .from("image_uploads")
        .select("id, is_pinned")
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)
        .single();

      if (!image) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Image not found" });
      }

      const newPinned = !(image.is_pinned ?? false);
      const { error } = await ctx.supabase
        .from("image_uploads")
        .update({ is_pinned: newPinned })
        .eq("id", input.id)
        .eq("user_id", ctx.user.id);

      if (error) throw error;

      return { pinned: newPinned };
    }),
});
