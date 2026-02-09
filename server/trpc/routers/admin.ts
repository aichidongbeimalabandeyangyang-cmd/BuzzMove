import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { CREDIT_PACKS, PLANS } from "@/lib/constants";

// Map transaction descriptions to revenue (cents)
function getRevenueCents(type: string, description: string): number {
  if (type === "purchase") {
    for (const pack of CREDIT_PACKS) {
      if (description?.includes(pack.name)) return pack.price;
    }
  }
  if (type === "subscription") {
    if (description?.includes("Pro") && !description?.includes("Premium")) return PLANS.pro.price_monthly;
    if (description?.includes("Premium")) return PLANS.premium.price_monthly;
  }
  return 0;
}

export const adminRouter = router({
  getDailyStats: adminProcedure.query(async ({ ctx }) => {
    const supabase = ctx.adminSupabase;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString();

    // Fetch all raw data for the 30-day window in parallel
    const [profilesRes, videosRes, transactionsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, created_at, initial_utm_source, initial_utm_campaign, initial_ref")
        .gte("created_at", since),
      supabase
        .from("videos")
        .select("id, user_id, created_at")
        .gte("created_at", since),
      supabase
        .from("credit_transactions")
        .select("id, user_id, type, amount, description, created_at")
        .gte("created_at", since)
        .in("type", ["purchase", "subscription"]),
    ]);

    const profiles = profilesRes.data ?? [];
    const videos = videosRes.data ?? [];
    const transactions = transactionsRes.data ?? [];

    // Group by date (YYYY-MM-DD)
    const toDateKey = (ts: string) => ts.slice(0, 10);

    // Build 30-day date range
    const days: string[] = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const dailyStats = days.map((day) => {
      const dayProfiles = profiles.filter((p) => toDateKey(p.created_at) === day);
      const dayVideos = videos.filter((v) => toDateKey(v.created_at) === day);
      const dayTx = transactions.filter((t) => toDateKey(t.created_at) === day);

      const activeUserIds = new Set(dayVideos.map((v) => v.user_id));
      const paidUserIds = new Set(dayTx.map((t) => t.user_id));

      let revenueCents = 0;
      const packCounts: Record<string, number> = {};

      for (const tx of dayTx) {
        revenueCents += getRevenueCents(tx.type, tx.description ?? "");
        const label = tx.type === "subscription" ? "Subscription" : (tx.description ?? "Unknown");
        packCounts[label] = (packCounts[label] || 0) + 1;
      }

      // Source breakdown for new users
      const sourceCounts: Record<string, number> = {};
      for (const p of dayProfiles) {
        const src = p.initial_ref ? "referral" : p.initial_utm_source || "organic";
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      }

      return {
        date: day,
        newUsers: dayProfiles.length,
        activeUsers: activeUserIds.size,
        videoCount: dayVideos.length,
        paidUsers: paidUserIds.size,
        revenueCents,
        packBreakdown: packCounts,
        sourceBreakdown: sourceCounts,
      };
    });

    // Source totals
    const totalSourceCounts: Record<string, number> = {};
    for (const p of profiles) {
      const src = p.initial_ref ? "referral" : p.initial_utm_source || "organic";
      totalSourceCounts[src] = (totalSourceCounts[src] || 0) + 1;
    }

    // Totals
    const totals = {
      newUsers: profiles.length,
      activeUsers: new Set(videos.map((v) => v.user_id)).size,
      videoCount: videos.length,
      paidUsers: new Set(transactions.map((t) => t.user_id)).size,
      revenueCents: transactions.reduce((sum, t) => sum + getRevenueCents(t.type, t.description ?? ""), 0),
      sourceBreakdown: totalSourceCounts,
    };

    return { days: dailyStats, totals };
  }),

  // List video tasks with user email, input image, output video
  getCases: adminProcedure
    .input(
      z.object({
        email: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = ctx.adminSupabase;

      // If filtering by email, find user IDs first
      let userFilter: string[] | null = null;
      if (input.email) {
        const { data: matchedProfiles } = await supabase
          .from("profiles")
          .select("id, email")
          .ilike("email", `%${input.email}%`);
        if (!matchedProfiles || matchedProfiles.length === 0) {
          return { cases: [], total: 0 };
        }
        userFilter = matchedProfiles.map((p) => p.id);
      }

      // Build query
      let query = supabase
        .from("videos")
        .select("id, user_id, input_image_url, output_video_url, prompt, status, mode, duration, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (userFilter) {
        query = query.in("user_id", userFilter);
      }

      const { data: videos, count } = await query;

      // Fetch emails for all user_ids in result
      const userIds = [...new Set((videos ?? []).map((v) => v.user_id))];
      let emailMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        for (const p of profiles ?? []) {
          emailMap[p.id] = p.email ?? "";
        }
      }

      return {
        cases: (videos ?? []).map((v) => ({
          id: v.id,
          email: emailMap[v.user_id] ?? "",
          inputImage: v.input_image_url,
          outputVideo: v.output_video_url,
          prompt: v.prompt,
          status: v.status,
          mode: v.mode,
          duration: v.duration,
          createdAt: v.created_at,
        })),
        total: count ?? 0,
      };
    }),
});
