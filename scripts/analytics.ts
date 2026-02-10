/**
 * BuzzMove Analytics Report
 * Pulls data from GA4 + Search Console and outputs a unified report.
 *
 * Usage: npx tsx scripts/analytics.ts [days]
 * Example: npx tsx scripts/analytics.ts 7
 */

import { google } from "googleapis";
import path from "path";

const GA4_PROPERTY_ID = "523808812";
const SITE_URL = "https://buzzmove.me";
const CREDENTIALS_PATH = path.resolve(__dirname, "../google-credentials.json");

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  });
  return auth;
}

// ---- GA4 Report ----
async function getGA4Report(days: number) {
  const auth = await getAuth();
  const analyticsData = google.analyticsdata({ version: "v1beta", auth });

  const startDate = `${days}daysAgo`;
  const endDate = "today";

  // 1. Overview metrics
  const overview = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
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
  });

  // 2. Events (our custom funnel events)
  const events = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [
        { name: "eventCount" },
        { name: "totalUsers" },
      ],
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
  });

  // 3. Traffic sources
  const sources = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "newUsers" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "15",
    },
  });

  // 4. Top pages
  const pages = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "bounceRate" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: "10",
    },
  });

  // 5. Device breakdown
  const devices = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    },
  });

  // 6. Country breakdown
  const countries = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "10",
    },
  });

  return { overview, events, sources, pages, devices, countries };
}

// ---- Search Console Report ----
async function getSearchConsoleReport(days: number) {
  const auth = await getAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  // Top queries
  const queries = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["query"],
      rowLimit: 20,
    },
  });

  // Top pages
  const pages = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["page"],
      rowLimit: 10,
    },
  });

  // Country breakdown
  const countries = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["country"],
      rowLimit: 10,
    },
  });

  return { queries, pages, countries };
}

// ---- Format & Print ----
function printTable(headers: string[], rows: string[][]) {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || "").length))
  );
  const sep = widths.map((w) => "-".repeat(w + 2)).join("+");
  const formatRow = (row: string[]) =>
    row.map((cell, i) => ` ${cell.padEnd(widths[i])} `).join("|");

  console.log(formatRow(headers));
  console.log(sep);
  rows.forEach((row) => console.log(formatRow(row)));
}

function formatReport(ga4: Awaited<ReturnType<typeof getGA4Report>>, gsc: Awaited<ReturnType<typeof getSearchConsoleReport>>, days: number) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  BUZZMOVE ANALYTICS REPORT (Last ${days} days)`);
  console.log(`  Generated: ${new Date().toISOString().split("T")[0]}`);
  console.log(`${"=".repeat(60)}\n`);

  // GA4 Overview
  const ov = ga4.overview.data?.rows?.[0]?.metricValues;
  if (ov) {
    console.log("## GA4 OVERVIEW");
    printTable(
      ["Metric", "Value"],
      [
        ["Active Users", ov[0]?.value || "0"],
        ["Sessions", ov[1]?.value || "0"],
        ["New Users", ov[2]?.value || "0"],
        ["Page Views", ov[3]?.value || "0"],
        ["Avg Session Duration", `${Math.round(parseFloat(ov[4]?.value || "0"))}s`],
        ["Bounce Rate", `${(parseFloat(ov[5]?.value || "0") * 100).toFixed(1)}%`],
      ]
    );
    console.log();
  }

  // Funnel Events
  console.log("## CONVERSION FUNNEL");
  const eventRows = ga4.events.data?.rows || [];
  const funnelOrder = [
    "login_modal_view", "sign_up", "image_upload",
    "video_generate", "paywall_view", "click_checkout",
    "purchase", "video_download_click", "click_share",
  ];
  const eventMap = new Map(
    eventRows.map((r) => [
      r.dimensionValues?.[0]?.value,
      { count: r.metricValues?.[0]?.value || "0", users: r.metricValues?.[1]?.value || "0" },
    ])
  );
  const funnelRows = funnelOrder
    .map((name) => {
      const data = eventMap.get(name);
      return [name, data?.count || "0", data?.users || "0"];
    })
    .filter((r) => r[1] !== "0");
  printTable(["Event", "Count", "Users"], funnelRows);

  // Calculate conversion rates
  const getCount = (name: string) => parseInt(eventMap.get(name)?.count || "0");
  const signups = getCount("sign_up");
  const uploads = getCount("image_upload");
  const generates = getCount("video_generate");
  const paywalls = getCount("paywall_view");
  const checkouts = getCount("click_checkout");
  const purchases = getCount("purchase");

  console.log("\n## CONVERSION RATES");
  const rates: string[][] = [];
  if (signups > 0 && uploads > 0) rates.push(["Sign-up → Upload", `${((uploads / signups) * 100).toFixed(1)}%`]);
  if (uploads > 0 && generates > 0) rates.push(["Upload → Generate", `${((generates / uploads) * 100).toFixed(1)}%`]);
  if (generates > 0 && paywalls > 0) rates.push(["Generate → Paywall", `${((paywalls / generates) * 100).toFixed(1)}%`]);
  if (paywalls > 0 && checkouts > 0) rates.push(["Paywall → Checkout", `${((checkouts / paywalls) * 100).toFixed(1)}%`]);
  if (checkouts > 0 && purchases > 0) rates.push(["Checkout → Purchase", `${((purchases / checkouts) * 100).toFixed(1)}%`]);
  if (signups > 0 && purchases > 0) rates.push(["Overall: Sign-up → Purchase", `${((purchases / signups) * 100).toFixed(1)}%`]);
  if (rates.length > 0) printTable(["Step", "Rate"], rates);
  console.log();

  // Traffic Sources
  console.log("## TRAFFIC SOURCES");
  const sourceRows = (ga4.sources.data?.rows || []).map((r) => [
    `${r.dimensionValues?.[0]?.value || "(direct)"} / ${r.dimensionValues?.[1]?.value || "(none)"}`,
    r.metricValues?.[0]?.value || "0",
    r.metricValues?.[1]?.value || "0",
    r.metricValues?.[2]?.value || "0",
  ]);
  printTable(["Source / Medium", "Sessions", "Users", "New Users"], sourceRows);
  console.log();

  // Top Pages
  console.log("## TOP PAGES");
  const pageRows = (ga4.pages.data?.rows || []).map((r) => [
    r.dimensionValues?.[0]?.value || "",
    r.metricValues?.[0]?.value || "0",
    r.metricValues?.[1]?.value || "0",
    `${(parseFloat(r.metricValues?.[2]?.value || "0") * 100).toFixed(1)}%`,
  ]);
  printTable(["Page", "Views", "Users", "Bounce"], pageRows);
  console.log();

  // Devices
  console.log("## DEVICES");
  const deviceRows = (ga4.devices.data?.rows || []).map((r) => [
    r.dimensionValues?.[0]?.value || "",
    r.metricValues?.[0]?.value || "0",
    r.metricValues?.[1]?.value || "0",
  ]);
  printTable(["Device", "Sessions", "Users"], deviceRows);
  console.log();

  // Countries (GA4)
  console.log("## TOP COUNTRIES (GA4)");
  const countryRows = (ga4.countries.data?.rows || []).map((r) => [
    r.dimensionValues?.[0]?.value || "",
    r.metricValues?.[0]?.value || "0",
    r.metricValues?.[1]?.value || "0",
  ]);
  printTable(["Country", "Sessions", "Users"], countryRows);
  console.log();

  // Search Console
  console.log("## SEARCH CONSOLE - TOP QUERIES");
  const queryRows = (gsc.queries.data?.rows || []).map((r) => [
    r.keys?.[0] || "",
    String(r.clicks || 0),
    String(r.impressions || 0),
    `${((r.ctr || 0) * 100).toFixed(1)}%`,
    (r.position || 0).toFixed(1),
  ]);
  if (queryRows.length > 0) {
    printTable(["Query", "Clicks", "Impressions", "CTR", "Position"], queryRows);
  } else {
    console.log("  No data yet (Search Console needs a few days to collect data)");
  }
  console.log();

  // Search Console Pages
  console.log("## SEARCH CONSOLE - TOP PAGES");
  const gscPageRows = (gsc.pages.data?.rows || []).map((r) => [
    (r.keys?.[0] || "").replace("https://buzzmove.me", ""),
    String(r.clicks || 0),
    String(r.impressions || 0),
    `${((r.ctr || 0) * 100).toFixed(1)}%`,
  ]);
  if (gscPageRows.length > 0) {
    printTable(["Page", "Clicks", "Impressions", "CTR"], gscPageRows);
  } else {
    console.log("  No data yet");
  }
  console.log();
}

// ---- Main ----
async function main() {
  const days = parseInt(process.argv[2] || "7");
  console.log(`Fetching analytics data for the last ${days} days...`);

  try {
    const [ga4, gsc] = await Promise.all([
      getGA4Report(days),
      getSearchConsoleReport(days),
    ]);
    formatReport(ga4, gsc, days);
  } catch (err: any) {
    console.error("Error:", err.message);
    if (err.message?.includes("permission")) {
      console.error("\nMake sure the service account has been added to GA4 and Search Console.");
    }
    process.exit(1);
  }
}

main();
