import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { collectAnalyticsData, type ReportType } from "@/server/services/analytics-data";
import { generateReport } from "@/server/services/report-generator";
import { createSupabaseAdminClient } from "@/server/supabase/server";

export const maxDuration = 60;

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

  try {
    // Alternate: 00:00 UTC → daily, 12:00 UTC → half_day
    const hourUTC = new Date().getUTCHours();
    const reportType: ReportType = hourUTC < 6 ? "daily" : "half_day";

    const now = new Date();
    const periodStart = new Date(now);
    if (reportType === "daily") {
      periodStart.setDate(periodStart.getDate() - 1);
    } else {
      periodStart.setTime(periodStart.getTime() - 12 * 60 * 60 * 1000);
    }

    // 1. Collect data
    const data = await collectAnalyticsData(reportType);

    // 2. Generate AI report
    const reportContent = await generateReport(data.formattedText, reportType);

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
      console.error("Failed to insert report:", insertError);
      return NextResponse.json({ error: "Database insert failed", details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, type: reportType, reportLength: reportContent.length });
  } catch (err: any) {
    console.error("Analytics report generation failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
