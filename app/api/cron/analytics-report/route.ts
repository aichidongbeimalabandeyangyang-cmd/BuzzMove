import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { collectAnalyticsData, type ReportType } from "@/server/services/analytics-data";
import { generateReport } from "@/server/services/report-generator";
import { createSupabaseAdminClient } from "@/server/supabase/server";

export const maxDuration = 300;

function isValidCronAuth(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authHeader) return false;
  const expected = `Bearer ${secret}`;
  if (authHeader.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
}

export async function GET(request: Request) {
  // Verify Vercel Cron authentication (constant-time comparison)
  if (!isValidCronAuth(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  try {
    // Alternate: 00:00 UTC → daily, 12:00 UTC → half_day
    const hourUTC = new Date().getUTCHours();
    const reportType: ReportType = hourUTC < 6 ? "daily" : "half_day";
    console.log(`[cron/analytics-report] Starting ${reportType} report, hour=${hourUTC}`);

    const now = new Date();
    const periodStart = new Date(now);
    if (reportType === "daily") {
      periodStart.setDate(periodStart.getDate() - 1);
    } else {
      periodStart.setTime(periodStart.getTime() - 12 * 60 * 60 * 1000);
    }

    // 1. Collect data
    const data = await collectAnalyticsData(reportType);
    console.log(`[cron/analytics-report] Data collected in ${Date.now() - t0}ms, text length=${data.formattedText.length}`);

    // 2. Generate AI report
    const reportContent = await generateReport(data.formattedText, reportType);
    console.log(`[cron/analytics-report] Report generated in ${Date.now() - t0}ms, html length=${reportContent.length}`);

    // 3. Store in Supabase
    const supabase = createSupabaseAdminClient();
    const { error: insertError } = await supabase.from("analytics_reports").insert({
      period_start: periodStart.toISOString(),
      period_end: now.toISOString(),
      report_type: reportType,
      raw_data: {
        internal: data.internal,
        formattedText: data.formattedText,
      },
      report_content: reportContent,
    });

    if (insertError) {
      console.error("[cron/analytics-report] DB insert failed:", insertError);
      return NextResponse.json({ error: "Database insert failed", details: insertError.message }, { status: 500 });
    }

    const totalMs = Date.now() - t0;
    console.log(`[cron/analytics-report] Done in ${totalMs}ms`);
    return NextResponse.json({ ok: true, type: reportType, reportLength: reportContent.length, durationMs: totalMs });
  } catch (err: any) {
    console.error(`[cron/analytics-report] Failed after ${Date.now() - t0}ms:`, err);
    return NextResponse.json({ error: err.message, stack: err.stack?.slice(0, 500) }, { status: 500 });
  }
}
