import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { resolveContentPolicy } from "@/server/services/content-policy";
import { validateDeviceKey, normalizeDeviceKey } from "@/server/services/device-fingerprint";
import { trackTikTokCAPISignUp } from "@/server/services/tiktok-capi";
import { trackFacebookCAPISignUp } from "@/server/services/facebook-capi";

export const trackingRouter = router({
  // Get content policy for a device (used by frontend to know what to show)
  getContentPolicy: publicProcedure
    .input(
      z.object({
        deviceKey: z.string(),
        countryCode: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!validateDeviceKey(input.deviceKey)) {
        return { policy: "strict" as const };
      }

      const policy = await resolveContentPolicy({
        userId: ctx.user?.id,
        deviceKey: normalizeDeviceKey(input.deviceKey),
        countryCode: input.countryCode,
      });

      return { policy };
    }),

  // Update geo information
  updateGeo: publicProcedure
    .input(
      z.object({
        deviceKey: z.string(),
        countryCode: z.string(),
        timezone: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!validateDeviceKey(input.deviceKey)) return { ok: false };

      const key = normalizeDeviceKey(input.deviceKey);

      // Update device channel
      await ctx.supabase
        .from("device_channels")
        .update({
          country_code: input.countryCode,
          last_seen_at: new Date().toISOString(),
        })
        .eq("device_key", key);

      // Update user profile if logged in
      if (ctx.user) {
        await ctx.supabase
          .from("profiles")
          .update({
            country_code: input.countryCode,
            timezone: input.timezone,
          })
          .eq("id", ctx.user.id);
      }

      return { ok: true };
    }),

  // Server-side signup tracking for email OTP (CAPI)
  trackSignUp: protectedProcedure
    .input(
      z.object({
        method: z.enum(["google", "email"]),
        isNewUser: z.boolean(),
        url: z.string().optional(),
        ttclid: z.string().optional(),
        fbclid: z.string().optional(),
        fbp: z.string().optional(),
        fbc: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.isNewUser) return { ok: true };

      const eventId = `signup_${ctx.user.id}_${Date.now()}`;

      trackTikTokCAPISignUp({
        userId: ctx.user.id,
        email: ctx.user.email || undefined,
        method: input.method,
        userAgent: ctx.userAgent,
        ip: ctx.ip,
        url: input.url,
        eventId,
        ttclid: input.ttclid,
      }).catch((e: unknown) => console.error("[tracking:signup] TikTok CAPI error:", e));

      trackFacebookCAPISignUp({
        userId: ctx.user.id,
        email: ctx.user.email || undefined,
        method: input.method,
        userAgent: ctx.userAgent,
        ip: ctx.ip,
        url: input.url,
        eventId,
        fbclid: input.fbclid,
        fbp: input.fbp,
        fbc: input.fbc,
      }).catch((e: unknown) => console.error("[tracking:signup] Facebook CAPI error:", e));

      return { ok: true };
    }),
});
