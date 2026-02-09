import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { REFERRAL_REWARD_CREDITS } from "@/lib/constants";

export const referralRouter = router({
  // Get current user's referral code + link
  getInfo: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", ctx.user.id)
      .single();

    const code = profile?.referral_code ?? null;
    return {
      referralCode: code,
      referralLink: code ? `https://www.buzzmove.me/?ref=${code}` : null,
      rewardCredits: REFERRAL_REWARD_CREDITS,
    };
  }),

  // Get referral stats + history
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { data: referrals } = await ctx.adminSupabase
      .from("referrals")
      .select("id, referee_id, status, reward_credits, rewarded_at, created_at")
      .eq("referrer_id", ctx.user.id)
      .order("created_at", { ascending: false });

    const list = referrals ?? [];
    const rewarded = list.filter((r) => r.status === "rewarded");
    const totalCreditsEarned = rewarded.reduce((sum, r) => sum + r.reward_credits, 0);

    // Fetch referee emails (masked)
    const refereeIds = list.map((r) => r.referee_id);
    let refereeMap: Record<string, string> = {};
    if (refereeIds.length > 0) {
      const { data: profiles } = await ctx.adminSupabase
        .from("profiles")
        .select("id, email")
        .in("id", refereeIds);
      for (const p of profiles ?? []) {
        const [local, domain] = (p.email ?? "").split("@");
        refereeMap[p.id] = local
          ? `${local.slice(0, 3)}***@${domain}`
          : "Anonymous";
      }
    }

    return {
      totalReferrals: list.length,
      rewardedReferrals: rewarded.length,
      pendingReferrals: list.length - rewarded.length,
      totalCreditsEarned,
      history: list.map((r) => ({
        id: r.id,
        refereeEmail: refereeMap[r.referee_id] ?? "Anonymous",
        status: r.status as "pending" | "rewarded",
        rewardCredits: r.reward_credits,
        rewardedAt: r.rewarded_at,
        createdAt: r.created_at,
      })),
    };
  }),

  // Link a referral code to the current user (called after signup)
  linkFromRef: protectedProcedure
    .input(z.object({ refCode: z.string().min(1).max(20) }))
    .mutation(async ({ ctx, input }) => {
      // Look up referrer by code
      const { data: referrer } = await ctx.adminSupabase
        .from("profiles")
        .select("id")
        .eq("referral_code", input.refCode)
        .single();

      if (!referrer) return { ok: false, reason: "invalid_code" };
      if (referrer.id === ctx.user.id) return { ok: false, reason: "self_referral" };

      // Check if already referred
      const { data: existing } = await ctx.adminSupabase
        .from("referrals")
        .select("id")
        .eq("referee_id", ctx.user.id)
        .single();

      if (existing) return { ok: false, reason: "already_referred" };

      // Create pending referral
      const { error } = await ctx.adminSupabase.from("referrals").insert({
        referrer_id: referrer.id,
        referee_id: ctx.user.id,
        status: "pending",
        reward_credits: REFERRAL_REWARD_CREDITS,
      });

      if (error) {
        if (error.code === "23505") return { ok: false, reason: "already_referred" };
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return { ok: true };
    }),
});
