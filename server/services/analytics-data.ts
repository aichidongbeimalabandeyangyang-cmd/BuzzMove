/**
 * Analytics data collection for automated reports.
 * Pulls data from GA4, Search Console, and Supabase.
 * Supports half-day (12h) and daily (24h + 7-day trend) reports.
 */

import { google } from "googleapis";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { CREDIT_PACKS, PLANS } from "@/lib/constants";

const GA4_PROPERTY_ID = "523808812";
const SITE_URL = "https://buzzmove.me";

function getGoogleAuth() {
  const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (!credentialsBase64) throw new Error("GOOGLE_CREDENTIALS_BASE64 env var not set");

  const credentials = JSON.parse(Buffer.from(credentialsBase64, "base64").toString());
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  });
}

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

// ---- GA4 ----
async function fetchGA4Data(days: number) {
  const auth = getGoogleAuth();
  const analyticsData = google.analyticsdata({ version: "v1beta", auth });
  const property = `properties/${GA4_PROPERTY_ID}`;
  const startDate = `${days}daysAgo`;
  const endDate = "today";

  const [overview, events, sources, pages, devices, countries, campaigns, adsDetail, landingPages, engagement] = await Promise.all([
    // -- existing queries --
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "newUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
      },
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: [
                "login_modal_view", "sign_up", "image_upload",
                "video_generate", "paywall_view", "click_checkout",
                "purchase", "video_download_click", "click_share",
              ],
            },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      },
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "newUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "15",
      },
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "bounceRate" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "10",
      },
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      },
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "10",
      },
    }),
    // -- deep queries: campaigns --
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionCampaignName" }, { name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "engagedSessions" },
          { name: "bounceRate" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "15",
      },
    }),
    // -- deep queries: Google Ads keywords & ad groups --
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: "sessionGoogleAdsAdGroupName" },
          { name: "sessionGoogleAdsKeyword" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "engagedSessions" },
        ],
        dimensionFilter: {
          filter: {
            fieldName: "sessionSource",
            stringFilter: { value: "google", matchType: "EXACT" },
          },
        },
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "20",
      },
    }),
    // -- deep queries: landing pages by source --
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "landingPage" }, { name: "sessionSource" }],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "15",
      },
    }),
    // -- deep queries: engagement by source/medium --
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [
          { name: "averageSessionDuration" },
          { name: "engagedSessions" },
          { name: "engagementRate" },
          { name: "sessionsPerUser" },
          { name: "screenPageViewsPerSession" },
        ],
        orderBys: [{ metric: { metricName: "engagedSessions" }, desc: true }],
        limit: "10",
      },
    }),
  ]);

  return { overview, events, sources, pages, devices, countries, campaigns, adsDetail, landingPages, engagement };
}

// ---- GA4 7-day daily trend ----
async function fetchGA4DailyTrend() {
  const auth = getGoogleAuth();
  const analyticsData = google.analyticsdata({ version: "v1beta", auth });
  const property = `properties/${GA4_PROPERTY_ID}`;

  const result = await analyticsData.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    },
  });

  return result;
}

// ---- Search Console ----
async function fetchGSCData(days: number) {
  const auth = getGoogleAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const [queries, pages] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["query"], rowLimit: 20 },
    }),
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["page"], rowLimit: 10 },
    }),
  ]);

  return { queries, pages };
}

// ---- Supabase internal data ----
async function fetchSupabaseData(hours: number) {
  const supabase = createSupabaseAdminClient();
  const since = new Date();
  since.setTime(since.getTime() - hours * 60 * 60 * 1000);
  const sinceISO = since.toISOString();

  const [profilesRes, videosRes, transactionsRes, totalUsersRes, totalVideosRes] = await Promise.all([
    supabase.from("profiles").select("id, created_at, initial_utm_source, initial_ref").gte("created_at", sinceISO),
    supabase.from("videos").select("id, user_id, status, mode, created_at").gte("created_at", sinceISO),
    supabase.from("credit_transactions").select("id, user_id, type, amount, description, price_cents, created_at").gte("created_at", sinceISO).in("type", ["purchase", "subscription"]),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }),
  ]);

  const profiles = profilesRes.data ?? [];
  const videos = videosRes.data ?? [];
  const transactions = transactionsRes.data ?? [];

  // Compute revenue
  let totalRevenueCents = 0;
  const packCounts: Record<string, number> = {};
  for (const tx of transactions) {
    totalRevenueCents += getRevenueCents(tx);
    const label = tx.type === "subscription" ? "Subscription" : (tx.description ?? "Unknown");
    packCounts[label] = (packCounts[label] || 0) + 1;
  }

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  for (const p of profiles) {
    const src = p.initial_ref ? "referral" : p.initial_utm_source || "organic";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  }

  // Video status breakdown
  const statusCounts: Record<string, number> = {};
  for (const v of videos) {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
  }

  return {
    newUsers: profiles.length,
    activeUsers: new Set(videos.map((v) => v.user_id)).size,
    totalUsers: totalUsersRes.count ?? 0,
    videosGenerated: videos.length,
    totalVideos: totalVideosRes.count ?? 0,
    videoStatusBreakdown: statusCounts,
    paidUsers: new Set(transactions.map((t) => t.user_id)).size,
    totalRevenueCents,
    packBreakdown: packCounts,
    sourceBreakdown: sourceCounts,
  };
}

// ---- Supabase 7-day daily trend ----
async function fetchSupabaseDailyTrend() {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - 7);
  const sinceISO = since.toISOString();

  const [profilesRes, videosRes, transactionsRes] = await Promise.all([
    supabase.from("profiles").select("id, created_at").gte("created_at", sinceISO),
    supabase.from("videos").select("id, user_id, created_at").gte("created_at", sinceISO),
    supabase.from("credit_transactions").select("id, user_id, type, amount, description, price_cents, created_at").gte("created_at", sinceISO).in("type", ["purchase", "subscription"]),
  ]);

  const profiles = profilesRes.data ?? [];
  const videos = videosRes.data ?? [];
  const transactions = transactionsRes.data ?? [];

  const toDateKey = (ts: string) => ts.slice(0, 10);

  // Build 8-day range (7 days ago through today)
  const days: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  return days.map((day) => {
    const dayProfiles = profiles.filter((p) => toDateKey(p.created_at) === day);
    const dayVideos = videos.filter((v) => toDateKey(v.created_at) === day);
    const dayTx = transactions.filter((t) => toDateKey(t.created_at) === day);

    return {
      date: day,
      newUsers: dayProfiles.length,
      activeUsers: new Set(dayVideos.map((v) => v.user_id)).size,
      videoCount: dayVideos.length,
      paidUsers: new Set(dayTx.map((t) => t.user_id)).size,
      revenueCents: dayTx.reduce((sum, t) => sum + getRevenueCents(t), 0),
    };
  });
}

// ---- GitHub Commits ----
const GITHUB_REPO = "superlion8/BuzzMove";

type CommitInfo = { sha: string; date: string; message: string; author: string };

async function fetchRecentCommits(days: number): Promise<CommitInfo[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const url = `https://api.github.com/repos/${GITHUB_REPO}/commits?since=${since.toISOString()}&per_page=100`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "BuzzMove-Analytics",
  };
  // Use token if available (higher rate limit), otherwise public API
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data as any[]).map((c) => ({
      sha: c.sha?.slice(0, 7) ?? "",
      date: c.commit?.author?.date?.slice(0, 10) ?? "",
      message: (c.commit?.message ?? "").split("\n")[0].slice(0, 120),
      author: c.commit?.author?.name ?? "",
    }));
  } catch {
    return []; // Non-critical, don't break report if GitHub is unreachable
  }
}

// ---- Format collected data as structured text for LLM ----
function formatDataForLLM(
  ga4: Awaited<ReturnType<typeof fetchGA4Data>>,
  gsc: Awaited<ReturnType<typeof fetchGSCData>>,
  internal: Awaited<ReturnType<typeof fetchSupabaseData>>,
  periodLabel: string,
  ga4Trend?: Awaited<ReturnType<typeof fetchGA4DailyTrend>>,
  supabaseTrend?: Awaited<ReturnType<typeof fetchSupabaseDailyTrend>>,
  commits?: CommitInfo[],
) {
  const lines: string[] = [];
  lines.push(`# BuzzMove Analytics Data (${periodLabel})\n`);

  // GA4 Overview
  const ov = ga4.overview.data?.rows?.[0]?.metricValues;
  if (ov) {
    lines.push("## GA4 Overview");
    lines.push(`- Active Users: ${ov[0]?.value}`);
    lines.push(`- Sessions: ${ov[1]?.value}`);
    lines.push(`- New Users: ${ov[2]?.value}`);
    lines.push(`- Page Views: ${ov[3]?.value}`);
    lines.push(`- Avg Session Duration: ${Math.round(parseFloat(ov[4]?.value || "0"))}s`);
    lines.push(`- Bounce Rate: ${(parseFloat(ov[5]?.value || "0") * 100).toFixed(1)}%\n`);
  }

  // Funnel Events
  lines.push("## Conversion Funnel Events");
  const funnelOrder = [
    "login_modal_view", "sign_up", "image_upload",
    "video_generate", "paywall_view", "click_checkout",
    "purchase", "video_download_click", "click_share",
  ];
  const eventRows = ga4.events.data?.rows || [];
  const eventMap = new Map(
    eventRows.map((r) => [
      r.dimensionValues?.[0]?.value,
      { count: r.metricValues?.[0]?.value || "0", users: r.metricValues?.[1]?.value || "0" },
    ])
  );
  for (const name of funnelOrder) {
    const data = eventMap.get(name);
    lines.push(`- ${name}: ${data?.count || 0} events, ${data?.users || 0} users`);
  }
  lines.push("");

  // Traffic Sources
  lines.push("## Traffic Sources (GA4)");
  for (const r of ga4.sources.data?.rows || []) {
    const src = r.dimensionValues?.[0]?.value || "(direct)";
    const medium = r.dimensionValues?.[1]?.value || "(none)";
    lines.push(`- ${src}/${medium}: ${r.metricValues?.[0]?.value} sessions, ${r.metricValues?.[1]?.value} users`);
  }
  lines.push("");

  // Campaign Performance (deep)
  lines.push("## Campaign Performance");
  for (const r of ga4.campaigns.data?.rows || []) {
    const campaign = r.dimensionValues?.[0]?.value || "(not set)";
    const src = r.dimensionValues?.[1]?.value || "";
    const medium = r.dimensionValues?.[2]?.value || "";
    const sessions = r.metricValues?.[0]?.value || "0";
    const users = r.metricValues?.[1]?.value || "0";
    const newUsers = r.metricValues?.[2]?.value || "0";
    const engaged = r.metricValues?.[3]?.value || "0";
    const bounce = (parseFloat(r.metricValues?.[4]?.value || "0") * 100).toFixed(1);
    lines.push(`- Campaign "${campaign}" (${src}/${medium}): ${sessions} sessions, ${users} users, ${newUsers} new users, ${engaged} engaged sessions, bounce ${bounce}%`);
  }
  lines.push("");

  // Google Ads Keywords & Ad Groups (deep)
  const adsRows = ga4.adsDetail.data?.rows || [];
  if (adsRows.length > 0) {
    lines.push("## Google Ads - Ad Groups & Keywords");
    for (const r of adsRows) {
      const adGroup = r.dimensionValues?.[0]?.value || "(not set)";
      const keyword = r.dimensionValues?.[1]?.value || "(not set)";
      const sessions = r.metricValues?.[0]?.value || "0";
      const users = r.metricValues?.[1]?.value || "0";
      const newUsers = r.metricValues?.[2]?.value || "0";
      const engaged = r.metricValues?.[3]?.value || "0";
      lines.push(`- Ad Group "${adGroup}" / Keyword "${keyword}": ${sessions} sessions, ${users} users, ${newUsers} new, ${engaged} engaged`);
    }
    lines.push("");
  }

  // Landing Pages by Source (deep)
  lines.push("## Landing Pages by Source");
  for (const r of ga4.landingPages.data?.rows || []) {
    const page = r.dimensionValues?.[0]?.value || "/";
    const src = r.dimensionValues?.[1]?.value || "(direct)";
    const sessions = r.metricValues?.[0]?.value || "0";
    const users = r.metricValues?.[1]?.value || "0";
    const bounce = (parseFloat(r.metricValues?.[2]?.value || "0") * 100).toFixed(1);
    const duration = Math.round(parseFloat(r.metricValues?.[3]?.value || "0"));
    lines.push(`- ${page} (from ${src}): ${sessions} sessions, ${users} users, bounce ${bounce}%, avg duration ${duration}s`);
  }
  lines.push("");

  // Engagement by Source (deep)
  lines.push("## User Engagement by Channel");
  for (const r of ga4.engagement.data?.rows || []) {
    const src = r.dimensionValues?.[0]?.value || "(direct)";
    const medium = r.dimensionValues?.[1]?.value || "(none)";
    const avgDuration = Math.round(parseFloat(r.metricValues?.[0]?.value || "0"));
    const engaged = r.metricValues?.[1]?.value || "0";
    const engagementRate = (parseFloat(r.metricValues?.[2]?.value || "0") * 100).toFixed(1);
    const sessPerUser = parseFloat(r.metricValues?.[3]?.value || "0").toFixed(2);
    const pagesPerSession = parseFloat(r.metricValues?.[4]?.value || "0").toFixed(1);
    lines.push(`- ${src}/${medium}: avg duration ${avgDuration}s, ${engaged} engaged sessions, engagement rate ${engagementRate}%, ${sessPerUser} sessions/user, ${pagesPerSession} pages/session`);
  }
  lines.push("");

  // Top Pages
  lines.push("## Top Pages (GA4)");
  for (const r of ga4.pages.data?.rows || []) {
    lines.push(`- ${r.dimensionValues?.[0]?.value}: ${r.metricValues?.[0]?.value} views, bounce ${(parseFloat(r.metricValues?.[2]?.value || "0") * 100).toFixed(1)}%`);
  }
  lines.push("");

  // Devices
  lines.push("## Devices");
  for (const r of ga4.devices.data?.rows || []) {
    lines.push(`- ${r.dimensionValues?.[0]?.value}: ${r.metricValues?.[0]?.value} sessions`);
  }
  lines.push("");

  // Countries
  lines.push("## Top Countries");
  for (const r of ga4.countries.data?.rows || []) {
    lines.push(`- ${r.dimensionValues?.[0]?.value}: ${r.metricValues?.[0]?.value} sessions`);
  }
  lines.push("");

  // GSC Queries
  lines.push("## Search Console - Top Queries");
  for (const r of gsc.queries.data?.rows || []) {
    lines.push(`- "${r.keys?.[0]}": ${r.clicks} clicks, ${r.impressions} impressions, CTR ${((r.ctr || 0) * 100).toFixed(1)}%, pos ${(r.position || 0).toFixed(1)}`);
  }
  lines.push("");

  // GSC Pages
  lines.push("## Search Console - Top Pages");
  for (const r of gsc.pages.data?.rows || []) {
    lines.push(`- ${(r.keys?.[0] || "").replace("https://buzzmove.me", "")}: ${r.clicks} clicks, ${r.impressions} impressions`);
  }
  lines.push("");

  // Internal Supabase data
  lines.push("## Internal Database Metrics");
  lines.push(`- Total registered users (all time): ${internal.totalUsers}`);
  lines.push(`- New users (period): ${internal.newUsers}`);
  lines.push(`- Active users generating videos (period): ${internal.activeUsers}`);
  lines.push(`- Videos generated (period): ${internal.videosGenerated}`);
  lines.push(`- Total videos (all time): ${internal.totalVideos}`);
  lines.push(`- Video status breakdown: ${JSON.stringify(internal.videoStatusBreakdown)}`);
  lines.push(`- Paid users (period): ${internal.paidUsers}`);
  lines.push(`- Revenue (period): $${(internal.totalRevenueCents / 100).toFixed(2)}`);
  lines.push(`- Pack breakdown: ${JSON.stringify(internal.packBreakdown)}`);
  lines.push(`- User acquisition sources: ${JSON.stringify(internal.sourceBreakdown)}`);
  lines.push("");

  // ---- 7-Day Trend (daily report only) ----
  if (ga4Trend && supabaseTrend) {
    lines.push("## 7-Day Daily Trend (GA4)");
    const trendRows = ga4Trend.data?.rows || [];
    // Parse into array sorted by date
    const ga4Daily = trendRows.map((r) => ({
      date: r.dimensionValues?.[0]?.value || "",
      activeUsers: parseInt(r.metricValues?.[0]?.value || "0"),
      sessions: parseInt(r.metricValues?.[1]?.value || "0"),
      newUsers: parseInt(r.metricValues?.[2]?.value || "0"),
      pageViews: parseInt(r.metricValues?.[3]?.value || "0"),
      bounceRate: parseFloat(r.metricValues?.[4]?.value || "0"),
      avgDuration: parseFloat(r.metricValues?.[5]?.value || "0"),
    })).sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 0; i < ga4Daily.length; i++) {
      const d = ga4Daily[i];
      const prev = i > 0 ? ga4Daily[i - 1] : null;
      const fmtDate = `${d.date.slice(0, 4)}-${d.date.slice(4, 6)}-${d.date.slice(6, 8)}`;

      let doD = "";
      if (prev) {
        const pctUsers = prev.activeUsers ? (((d.activeUsers - prev.activeUsers) / prev.activeUsers) * 100).toFixed(1) : "N/A";
        const pctSessions = prev.sessions ? (((d.sessions - prev.sessions) / prev.sessions) * 100).toFixed(1) : "N/A";
        const pctNew = prev.newUsers ? (((d.newUsers - prev.newUsers) / prev.newUsers) * 100).toFixed(1) : "N/A";
        doD = ` | 环比: users ${pctUsers}%, sessions ${pctSessions}%, new ${pctNew}%`;
      }

      lines.push(`- ${fmtDate}: ${d.activeUsers} active users, ${d.sessions} sessions, ${d.newUsers} new users, ${d.pageViews} page views, bounce ${(d.bounceRate * 100).toFixed(1)}%, avg ${Math.round(d.avgDuration)}s${doD}`);
    }

    // Week-over-week comparison (day 0 vs day 7 / first vs last)
    if (ga4Daily.length >= 2) {
      const first = ga4Daily[0];
      const last = ga4Daily[ga4Daily.length - 1];
      const wowUsers = first.activeUsers ? (((last.activeUsers - first.activeUsers) / first.activeUsers) * 100).toFixed(1) : "N/A";
      const wowSessions = first.sessions ? (((last.sessions - first.sessions) / first.sessions) * 100).toFixed(1) : "N/A";
      const wowNew = first.newUsers ? (((last.newUsers - first.newUsers) / first.newUsers) * 100).toFixed(1) : "N/A";
      lines.push(`- 同比 (7-day span): active users ${wowUsers}%, sessions ${wowSessions}%, new users ${wowNew}%`);
    }
    lines.push("");

    // Supabase daily trend
    lines.push("## 7-Day Daily Trend (Internal DB)");
    for (let i = 0; i < supabaseTrend.length; i++) {
      const d = supabaseTrend[i];
      const prev = i > 0 ? supabaseTrend[i - 1] : null;

      let doD = "";
      if (prev) {
        const pctNew = prev.newUsers ? (((d.newUsers - prev.newUsers) / prev.newUsers) * 100).toFixed(1) : "N/A";
        const pctVideos = prev.videoCount ? (((d.videoCount - prev.videoCount) / prev.videoCount) * 100).toFixed(1) : "N/A";
        const pctRevenue = prev.revenueCents ? (((d.revenueCents - prev.revenueCents) / prev.revenueCents) * 100).toFixed(1) : "N/A";
        doD = ` | 环比: new users ${pctNew}%, videos ${pctVideos}%, revenue ${pctRevenue}%`;
      }

      lines.push(`- ${d.date}: ${d.newUsers} new users, ${d.activeUsers} active, ${d.videoCount} videos, ${d.paidUsers} paid, $${(d.revenueCents / 100).toFixed(2)} revenue${doD}`);
    }

    // Week-over-week
    if (supabaseTrend.length >= 2) {
      const first = supabaseTrend[0];
      const last = supabaseTrend[supabaseTrend.length - 1];
      const wowNew = first.newUsers ? (((last.newUsers - first.newUsers) / first.newUsers) * 100).toFixed(1) : "N/A";
      const wowVideos = first.videoCount ? (((last.videoCount - first.videoCount) / first.videoCount) * 100).toFixed(1) : "N/A";
      const wowRevenue = first.revenueCents ? (((last.revenueCents - first.revenueCents) / first.revenueCents) * 100).toFixed(1) : "N/A";
      lines.push(`- 同比 (7-day span): new users ${wowNew}%, videos ${wowVideos}%, revenue ${wowRevenue}%`);
    }
    lines.push("");
  }

  // ---- Recent Code Changes (Git Commits) ----
  if (commits && commits.length > 0) {
    lines.push("## Recent Code Changes (Git Commits)");
    lines.push("以下是报告周期内的产品/代码改动，请结合数据指标变化分析这些改动的潜在影响：\n");

    // Group commits by date
    const byDate = new Map<string, CommitInfo[]>();
    for (const c of commits) {
      const list = byDate.get(c.date) ?? [];
      list.push(c);
      byDate.set(c.date, list);
    }

    for (const [date, dateCommits] of byDate) {
      lines.push(`### ${date}`);
      for (const c of dateCommits) {
        lines.push(`- [${c.sha}] ${c.message}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export type ReportType = "half_day" | "daily";

export type AnalyticsRawData = {
  ga4: Awaited<ReturnType<typeof fetchGA4Data>>;
  gsc: Awaited<ReturnType<typeof fetchGSCData>>;
  internal: Awaited<ReturnType<typeof fetchSupabaseData>>;
  formattedText: string;
};

export async function collectAnalyticsData(type: ReportType = "daily"): Promise<AnalyticsRawData> {
  const isDaily = type === "daily";
  const ga4Days = isDaily ? 1 : 1; // GA4 minimum granularity is 1 day; Supabase uses hours for precision
  const supabaseHours = isDaily ? 24 : 12;
  const gscDays = isDaily ? 1 : 1;

  const baseFetches = [
    fetchGA4Data(ga4Days),
    fetchGSCData(gscDays),
    fetchSupabaseData(supabaseHours),
  ] as const;

  if (isDaily) {
    // Daily: also fetch 7-day trends + commits
    const [ga4, gsc, internal, ga4Trend, supabaseTrend, commits] = await Promise.all([
      ...baseFetches,
      fetchGA4DailyTrend(),
      fetchSupabaseDailyTrend(),
      fetchRecentCommits(7),
    ]);

    const periodLabel = "Last 24 hours + 7-day trend";
    const formattedText = formatDataForLLM(ga4, gsc, internal, periodLabel, ga4Trend, supabaseTrend, commits);
    return { ga4, gsc, internal, formattedText };
  } else {
    // Half-day: fetch last 1 day of commits
    const [ga4, gsc, internal, commits] = await Promise.all([
      ...baseFetches,
      fetchRecentCommits(1),
    ]);
    const periodLabel = "Last 12 hours";
    const formattedText = formatDataForLLM(ga4, gsc, internal, periodLabel, undefined, undefined, commits);
    return { ga4, gsc, internal, formattedText };
  }
}
