import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { validateEmailDomain } from "@/server/services/email-validation";

export const userRouter = router({
  // Validate email domain (block disposable emails before OTP)
  validateEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      return validateEmailDomain(input.email);
    }),

  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url, subscription_plan, subscription_status, credits_balance, country_code, timezone, stripe_customer_id, created_at")
      .eq("id", ctx.user.id)
      .single();

    if (error) throw error;

    // Don't leak full Stripe ID to client — just expose whether it exists
    return {
      ...data,
      stripe_customer_id: data?.stripe_customer_id ? true : null,
    };
  }),

  // Track UTM parameters (called on first visit)
  trackUtm: publicProcedure
    .input(
      z.object({
        utm_source: z.string().nullable(),
        utm_medium: z.string().nullable(),
        utm_campaign: z.string().nullable(),
        ref: z.string().nullable(),
        device_key: z.string(),
        country_code: z.string().nullable(),
        timezone: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Determine content policy based on UTM campaign
      const isRelaxedCampaign =
        input.utm_campaign &&
        /nsfw|uncensored|unrestricted|unfiltered|adult/i.test(
          input.utm_campaign
        );
      const isRelaxedRef =
        input.ref && /nsfw|uncensored|adult/i.test(input.ref);

      const contentPolicy =
        isRelaxedCampaign || isRelaxedRef ? "relaxed" : "strict";

      // Upsert device channel — only set on first visit (don't overwrite)
      const { data: existing } = await ctx.supabase
        .from("device_channels")
        .select("device_key")
        .eq("device_key", input.device_key)
        .single();

      if (!existing) {
        await ctx.supabase.from("device_channels").insert({
          device_key: input.device_key,
          utm_source: input.utm_source,
          utm_campaign: input.utm_campaign,
          ref_param: input.ref,
          content_policy: contentPolicy,
          country_code: input.country_code,
        });
      } else {
        // Only update last_seen
        await ctx.supabase
          .from("device_channels")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("device_key", input.device_key);
      }

      // If user is logged in, update profile with initial UTM data
      if (ctx.user) {
        const { data: profile } = await ctx.supabase
          .from("profiles")
          .select("initial_utm_source")
          .eq("id", ctx.user.id)
          .single();

        // Only set initial values if not already set
        if (profile && !profile.initial_utm_source) {
          await ctx.supabase
            .from("profiles")
            .update({
              initial_utm_source: input.utm_source,
              initial_utm_campaign: input.utm_campaign,
              initial_ref: input.ref,
              content_policy: contentPolicy,
              device_key: input.device_key,
              country_code: input.country_code,
              timezone: input.timezone,
            })
            .eq("id", ctx.user.id);
        }
      }

      return { contentPolicy };
    }),
});
