/**
 * Analytics data collection for automated reports.
 * Pulls data from GA4, Search Console, and Supabase.
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
    if (desc.includes("Pro") && !desc.includes("Premium")) return PLANS.pro.price_monthly;
    if (desc.includes("Premium")) return PLANS.premium.price_monthly;
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

  const [overview, events, sources, pages, devices, countries] = await Promise.all([
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
  ]);

  return { overview, events, sources, pages, devices, countries };
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
async function fetchSupabaseData(days: number) {
  const supabase = createSupabaseAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
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

// ---- Format collected data as structured text for LLM ----
function formatDataForLLM(
  ga4: Awaited<ReturnType<typeof fetchGA4Data>>,
  gsc: Awaited<ReturnType<typeof fetchGSCData>>,
  internal: Awaited<ReturnType<typeof fetchSupabaseData>>,
  days: number,
) {
  const lines: string[] = [];
  lines.push(`# BuzzMove Analytics Data (Last ${days} days)\n`);

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
  lines.push(`- New users (${days}d): ${internal.newUsers}`);
  lines.push(`- Active users generating videos (${days}d): ${internal.activeUsers}`);
  lines.push(`- Videos generated (${days}d): ${internal.videosGenerated}`);
  lines.push(`- Total videos (all time): ${internal.totalVideos}`);
  lines.push(`- Video status breakdown: ${JSON.stringify(internal.videoStatusBreakdown)}`);
  lines.push(`- Paid users (${days}d): ${internal.paidUsers}`);
  lines.push(`- Revenue (${days}d): $${(internal.totalRevenueCents / 100).toFixed(2)}`);
  lines.push(`- Pack breakdown: ${JSON.stringify(internal.packBreakdown)}`);
  lines.push(`- User acquisition sources: ${JSON.stringify(internal.sourceBreakdown)}`);

  return lines.join("\n");
}

export type AnalyticsRawData = {
  ga4: Awaited<ReturnType<typeof fetchGA4Data>>;
  gsc: Awaited<ReturnType<typeof fetchGSCData>>;
  internal: Awaited<ReturnType<typeof fetchSupabaseData>>;
  formattedText: string;
};

export async function collectAnalyticsData(days: number = 1): Promise<AnalyticsRawData> {
  const [ga4, gsc, internal] = await Promise.all([
    fetchGA4Data(days),
    fetchGSCData(days),
    fetchSupabaseData(days),
  ]);

  const formattedText = formatDataForLLM(ga4, gsc, internal, days);

  return { ga4, gsc, internal, formattedText };
}
