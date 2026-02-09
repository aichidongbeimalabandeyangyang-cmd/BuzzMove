import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const imageRouter = router({
  // List user's uploaded images (newest first)
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("image_uploads")
        .select("id, url, filename, created_at")
        .eq("user_id", ctx.user.id)
        .order("created_at", { ascending: false })
        .limit(input.limit);

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
});
