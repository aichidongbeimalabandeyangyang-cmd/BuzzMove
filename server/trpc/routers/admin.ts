import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../trpc";
import { CREDIT_PACKS, PLANS, ADMIN_EMAILS } from "@/lib/constants";
import { collectAnalyticsData, type ReportType } from "@/server/services/analytics-data";
import { generateReport } from "@/server/services/report-generator";
import { getStripe } from "@/server/stripe/client";
import { generateToken as generateKlingToken } from "@/server/kling/client";

// Map transaction to revenue (cents).
// Prefer structured price_cents column; fall back to description matching for historical data.
function getRevenueCents(tx: { type: string; description: string | null; price_cents?: number | null }): number {
  if (tx.price_cents != null) return tx.price_cents;
  const desc = tx.description ?? "";
  if (tx.type === "purchase") {
    for (const pack of CREDIT_PACKS) {
      if (desc.includes(pack.name)) return pack.price;
    }
  }
  if (tx.type === "subscription") {
    if (desc.includes("Pro") && !desc.includes("Premium")) return PLANS.pro.price_weekly;
    if (desc.includes("Premium")) return PLANS.premium.price_weekly;
  }
  return 0;
}

export const adminRouter = router({
  // Non-throwing admin check for UI (sidebar nav visibility)
  isAdmin: protectedProcedure.query(({ ctx }) => {
    return ADMIN_EMAILS.includes(ctx.user.email ?? "");
  }),

  getDailyStats: adminProcedure.query(async ({ ctx }) => {
    const supabase = ctx.adminSupabase;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString();

    // Fetch all raw data for the 30-day window in parallel
    const [profilesRes, videosRes, transactionsRes, deductionsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, created_at, initial_utm_source, initial_utm_campaign, initial_ref")
        .gte("created_at", since),
      supabase
        .from("videos")
        .select("id, user_id, created_at")
        .gte("created_at", since),
      supabase
        .from("credit_transactions")
        .select("id, user_id, type, amount, description, price_cents, created_at")
        .gte("created_at", since)
        .in("type", ["purchase", "subscription"]),
      supabase
        .from("credit_transactions")
        .select("id, amount, created_at")
        .gte("created_at", since)
        .eq("type", "deduction"),
    ]);

    const allProfiles = profilesRes.data ?? [];

    // Exclude admin users from stats (admins do test transactions)
    const adminUserIds = new Set(
      allProfiles.filter((p) => ADMIN_EMAILS.includes(p.email ?? "")).map((p) => p.id)
    );
    const profiles = allProfiles.filter((p) => !adminUserIds.has(p.id));
    const videos = (videosRes.data ?? []).filter((v) => !adminUserIds.has(v.user_id));
    const transactions = (transactionsRes.data ?? []).filter((t) => !adminUserIds.has(t.user_id));
    const deductions = deductionsRes.data ?? [];

    // Group by date (YYYY-MM-DD) in UTC+8 so daily stats match local/business time
    const toDateKey = (ts: string) => {
      const d = new Date(ts);
      const utc8 = new Date(d.getTime() + 8 * 60 * 60 * 1000);
      return utc8.toISOString().slice(0, 10);
    };

    // Build 30-day date range (UTC+8)
    const days: string[] = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const utc8 = new Date(d.getTime() + 8 * 60 * 60 * 1000);
      days.push(utc8.toISOString().slice(0, 10));
    }

    // Track users who paid before each day to identify first-time payers
    const seenPaidUsers = new Set<string>();

    const dailyStats = days.map((day) => {
      const dayProfiles = profiles.filter((p) => toDateKey(p.created_at) === day);
      const dayVideos = videos.filter((v) => toDateKey(v.created_at) === day);
      const dayTx = transactions.filter((t) => toDateKey(t.created_at) === day);

      const dayDeductions = deductions.filter((d) => toDateKey(d.created_at) === day);
      const activeUserIds = new Set(dayVideos.map((v) => v.user_id));
      const paidUserIds = new Set(dayTx.map((t) => t.user_id));

      const creditsConsumed = dayDeductions.reduce((sum, d) => sum + Math.abs(d.amount), 0);
      let newPaidUsers = 0;
      for (const uid of paidUserIds) {
        if (!seenPaidUsers.has(uid)) {
          newPaidUsers++;
          seenPaidUsers.add(uid);
        }
      }
      let revenueCents = 0;
      const packCounts: Record<string, number> = {};

      for (const tx of dayTx) {
        revenueCents += getRevenueCents(tx);
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
        creditsConsumed,
        paidUsers: paidUserIds.size,
        newPaidUsers,
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
      creditsConsumed: deductions.reduce((sum, d) => sum + Math.abs(d.amount), 0),
      paidUsers: new Set(transactions.map((t) => t.user_id)).size,
      revenueCents: transactions.reduce((sum, t) => sum + getRevenueCents(t), 0),
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
        .select("id, user_id, input_image_url, output_video_url, prompt, status, mode, duration, created_at, downloaded_at", { count: "exact" })
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
          downloadedAt: v.downloaded_at,
        })),
        total: count ?? 0,
      };
    }),

  // ---- Transactions (Stripe events — payments, failures, cancellations) ----
  getTransactions: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(30),
        startingAfter: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const stripe = getStripe();
      const supabase = ctx.adminSupabase;

      const events = await stripe.events.list({
        limit: input.limit,
        types: [
          "payment_intent.succeeded",
          "payment_intent.payment_failed",
          "customer.subscription.deleted",
          "charge.refunded",
        ],
        ...(input.startingAfter ? { starting_after: input.startingAfter } : {}),
      });

      // Extract Stripe customer IDs and supabase user IDs to resolve emails
      const customerIds = new Set<string>();
      const supabaseUserIds = new Set<string>();
      for (const event of events.data) {
        const obj = event.data.object as any;
        if (obj.customer && typeof obj.customer === "string") customerIds.add(obj.customer);
        if (obj.metadata?.supabase_user_id) supabaseUserIds.add(obj.metadata.supabase_user_id);
      }

      // Batch resolve: Stripe customers + Supabase profiles
      const [customerEmails, profileEmails] = await Promise.all([
        (async () => {
          const map: Record<string, string> = {};
          await Promise.all(
            [...customerIds].map(async (cid) => {
              try {
                const c = await stripe.customers.retrieve(cid);
                if (!c.deleted && c.email) map[cid] = c.email;
              } catch {}
            })
          );
          return map;
        })(),
        (async () => {
          const map: Record<string, string> = {};
          const ids = [...supabaseUserIds];
          if (ids.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, email")
              .in("id", ids);
            for (const p of profiles ?? []) {
              if (p.email) map[p.id] = p.email;
            }
          }
          return map;
        })(),
      ]);

      const transactions = events.data.map((event) => {
        const obj = event.data.object as any;
        let amountCents = 0;
        let currency = "usd";
        let status = "";
        let description = "";

        // Resolve email: receipt_email > charges billing > Stripe customer > Supabase profile
        const email = obj.receipt_email
          ?? obj.charges?.data?.[0]?.billing_details?.email
          ?? obj.billing_details?.email
          ?? (obj.customer ? customerEmails[obj.customer] : null)
          ?? (obj.metadata?.supabase_user_id ? profileEmails[obj.metadata.supabase_user_id] : null)
          ?? "";

        switch (event.type) {
          case "payment_intent.succeeded": {
            amountCents = obj.amount ?? 0;
            currency = obj.currency ?? "usd";
            status = "succeeded";
            // Resolve product name: try metadata first, then match by amount
            const packId = obj.metadata?.pack_id;
            const plan = obj.metadata?.plan;
            const pack = packId
              ? CREDIT_PACKS.find((p) => p.id === packId)
              : CREDIT_PACKS.find((p) => p.price === amountCents);
            const planConfig = plan && plan in PLANS ? (PLANS as any)[plan] : null;
            const planByAmount = !pack && !planConfig
              ? Object.values(PLANS).find((p: any) =>
                  p.price_weekly === amountCents || p.price_yearly === amountCents || p.trial_price_weekly === amountCents
                ) as any
              : null;
            description = pack ? pack.name
              : planConfig ? `${planConfig.name} subscription`
              : planByAmount ? `${planByAmount.name} subscription`
              : obj.description ?? "Payment";
            break;
          }
          case "payment_intent.payment_failed":
            amountCents = obj.amount ?? 0;
            currency = obj.currency ?? "usd";
            status = "failed";
            description = obj.last_payment_error?.message
              ?? obj.last_payment_error?.decline_code
              ?? obj.charges?.data?.[0]?.failure_message
              ?? obj.charges?.data?.[0]?.failure_code
              ?? "Payment failed";
            break;
          case "customer.subscription.deleted":
            amountCents = 0;
            currency = obj.currency ?? "usd";
            status = "canceled";
            description = "Subscription canceled";
            break;
          case "charge.refunded":
            amountCents = obj.amount_refunded ?? 0;
            currency = obj.currency ?? "usd";
            status = "refunded";
            description = "Refund";
            break;
        }

        return {
          id: event.id,
          type: event.type,
          email,
          amountCents,
          currency,
          status,
          description,
          createdAt: new Date(event.created * 1000).toISOString(),
        };
      });

      return {
        transactions,
        hasMore: events.has_more,
        lastId: events.data.at(-1)?.id,
      };
    }),

  // ---- Paid Users Credit Monitor ----
  getPaidUsers: adminProcedure.query(async ({ ctx }) => {
    const supabase = ctx.adminSupabase;

    // Get all purchase/subscription transactions grouped by user
    const { data: transactions } = await supabase
      .from("credit_transactions")
      .select("user_id, amount, type")
      .in("type", ["purchase", "subscription"]);

    if (!transactions || transactions.length === 0) return { users: [] };

    // Sum total credits purchased per user
    const userCreditsMap: Record<string, number> = {};
    for (const tx of transactions) {
      userCreditsMap[tx.user_id] = (userCreditsMap[tx.user_id] || 0) + tx.amount;
    }

    const userIds = Object.keys(userCreditsMap);

    // Get profiles for these users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, credits_balance, subscription_plan")
      .in("id", userIds);

    const users = (profiles ?? []).map((p) => ({
      email: p.email ?? "",
      plan: p.subscription_plan ?? "free",
      totalCredits: userCreditsMap[p.id] ?? 0,
      balance: p.credits_balance ?? 0,
    }));

    // Sort by total credits descending
    users.sort((a, b) => b.totalCredits - a.totalCredits);

    return { users };
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

  generateReport: adminProcedure
    .input(z.object({
      type: z.enum(["half_day", "daily"]).default("daily"),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      const reportType: ReportType = input?.type ?? "daily";
      const now = new Date();
      const periodStart = new Date(now);
      if (reportType === "daily") {
        periodStart.setDate(periodStart.getDate() - 1);
      } else {
        periodStart.setTime(periodStart.getTime() - 12 * 60 * 60 * 1000);
      }

      const data = await collectAnalyticsData(reportType);
      const reportContent = await generateReport(data.formattedText, reportType);

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

    // Video stats by status (capped to prevent unbounded queries)
    const [videos24hRes, videos7dRes] = await Promise.all([
      supabase.from("videos").select("status").gte("created_at", since24h).limit(5000),
      supabase.from("videos").select("status").gte("created_at", since7d).limit(20000),
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
      .gte("created_at", since7d)
      .limit(10000);

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
      supabase.from("system_events").select("event, metadata, email, created_at").gte("created_at", since24h).order("created_at", { ascending: false }).limit(500),
      supabase.from("system_events").select("event").gte("created_at", since7d).limit(5000),
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
