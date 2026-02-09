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
        .select("id, created_at")
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

      return {
        date: day,
        newUsers: dayProfiles.length,
        activeUsers: activeUserIds.size,
        videoCount: dayVideos.length,
        paidUsers: paidUserIds.size,
        revenueCents,
        packBreakdown: packCounts,
      };
    });

    // Totals
    const totals = {
      newUsers: profiles.length,
      activeUsers: new Set(videos.map((v) => v.user_id)).size,
      videoCount: videos.length,
      paidUsers: new Set(transactions.map((t) => t.user_id)).size,
      revenueCents: transactions.reduce((sum, t) => sum + getRevenueCents(t.type, t.description ?? ""), 0),
    };

    return { days: dailyStats, totals };
  }),
});
