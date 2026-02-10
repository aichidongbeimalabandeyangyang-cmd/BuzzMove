import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { CREDIT_PACKS, PLANS } from "@/lib/constants";
import { collectAnalyticsData } from "@/server/services/analytics-data";
import { generateReport } from "@/server/services/report-generator";
import { getStripe } from "@/server/stripe/client";
import { generateToken as generateKlingToken } from "@/server/kling/client";

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

  // ---- Analytics Reports ----
  getReports: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const supabase = ctx.adminSupabase;
      const { data, count } = await supabase
        .from("analytics_reports")
        .select("id, created_at, period_start, period_end, report_type, report_content", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      return { reports: data ?? [], total: count ?? 0 };
    }),

  getReport: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = ctx.adminSupabase;
      const { data, error } = await supabase
        .from("analytics_reports")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error || !data) {
        throw new Error("Report not found");
      }
      return data;
    }),

  generateReport: adminProcedure.mutation(async ({ ctx }) => {
    const days = 1;
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);

    const data = await collectAnalyticsData(days);
    const reportContent = await generateReport(data.formattedText);

    const supabase = ctx.adminSupabase;
    const { data: inserted, error } = await supabase
      .from("analytics_reports")
      .insert({
        period_start: periodStart.toISOString(),
        period_end: now.toISOString(),
        report_type: "manual",
        raw_data: { internal: data.internal, formattedText: data.formattedText },
        report_content: reportContent,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to save report: ${error.message}`);
    return { id: inserted.id };
  }),

  // ---- Infrastructure Monitoring ----
  getMonitoringData: adminProcedure.query(async ({ ctx }) => {
    const supabase = ctx.adminSupabase;
    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Health Checks (parallel, 5s timeout each)
    const [dbCheck, klingCheck, stripeCheck] = await Promise.allSettled([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      fetch("https://api.klingai.com/v1/videos/image2video", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${generateKlingToken()}`,
        },
        signal: AbortSignal.timeout(5000),
      }),
      getStripe().balance.retrieve(),
    ]);

    const healthChecks = {
      supabase: dbCheck.status === "fulfilled" && !dbCheck.value.error,
      kling: klingCheck.status === "fulfilled",
      stripe: stripeCheck.status === "fulfilled",
    };

    // Video stats by status
    const [videos24hRes, videos7dRes] = await Promise.all([
      supabase.from("videos").select("status").gte("created_at", since24h),
      supabase.from("videos").select("status").gte("created_at", since7d),
    ]);

    function countByStatus(videos: { status: string }[]) {
      const counts = { pending: 0, generating: 0, completed: 0, failed: 0 };
      for (const v of videos) {
        if (v.status in counts) counts[v.status as keyof typeof counts]++;
      }
      const total = videos.length;
      const successRate = total > 0 ? Math.round((counts.completed / total) * 100) : 0;
      const failRate = total > 0 ? Math.round((counts.failed / total) * 100) : 0;
      return { ...counts, total, successRate, failRate };
    }

    const videoStats = {
      last24h: countByStatus(videos24hRes.data ?? []),
      last7d: countByStatus(videos7dRes.data ?? []),
    };

    // Credit transaction breakdown (7d)
    const { data: txData } = await supabase
      .from("credit_transactions")
      .select("type, amount, created_at")
      .gte("created_at", since7d);

    const creditStats: Record<string, number> = {};
    for (const tx of txData ?? []) {
      creditStats[tx.type] = (creditStats[tx.type] || 0) + 1;
    }

    // Stuck videos (generating > 30 min)
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    const { data: stuckVideos } = await supabase
      .from("videos")
      .select("id, user_id, created_at, mode, duration")
      .eq("status", "generating")
      .lt("created_at", thirtyMinAgo)
      .order("created_at", { ascending: true })
      .limit(10);

    // Recent failures (last 20)
    const { data: recentFailures } = await supabase
      .from("videos")
      .select("id, user_id, mode, duration, created_at, prompt")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(20);

    // Get emails for failed + stuck video users
    const allUserIds = [
      ...new Set([
        ...(recentFailures ?? []).map((v) => v.user_id),
        ...(stuckVideos ?? []).map((v) => v.user_id),
      ]),
    ];
    let emailMap: Record<string, string> = {};
    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", allUserIds);
      for (const p of profiles ?? []) {
        emailMap[p.id] = p.email ?? "";
      }
    }

    // System events (24h + 7d)
    const [events24hRes, events7dRes] = await Promise.all([
      supabase.from("system_events").select("event, metadata, email, created_at").gte("created_at", since24h).order("created_at", { ascending: false }),
      supabase.from("system_events").select("event").gte("created_at", since7d),
    ]);

    function countByEvent(events: { event: string }[]) {
      const counts: Record<string, number> = {};
      for (const e of events) {
        counts[e.event] = (counts[e.event] || 0) + 1;
      }
      return counts;
    }

    const eventStats = {
      last24h: countByEvent(events24hRes.data ?? []),
      last7d: countByEvent(events7dRes.data ?? []),
      recentEvents: (events24hRes.data ?? []).slice(0, 30),
    };

    // Totals
    const [totalUsersRes, totalVideosRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("videos").select("id", { count: "exact", head: true }),
    ]);

    return {
      healthChecks,
      videoStats,
      creditStats,
      stuckVideos: (stuckVideos ?? []).map((v) => ({
        ...v,
        email: emailMap[v.user_id] ?? "",
        minutesStuck: Math.round((now.getTime() - new Date(v.created_at).getTime()) / 60000),
      })),
      recentFailures: (recentFailures ?? []).map((v) => ({
        ...v,
        email: emailMap[v.user_id] ?? "",
      })),
      totals: {
        users: totalUsersRes.count ?? 0,
        videos: totalVideosRes.count ?? 0,
      },
      eventStats,
      checkedAt: now.toISOString(),
    };
  }),
});
