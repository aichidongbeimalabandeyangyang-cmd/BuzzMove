import { NextResponse } from "next/server";
import { collectAnalyticsData } from "@/server/services/analytics-data";
import { generateReport } from "@/server/services/report-generator";
import { createSupabaseAdminClient } from "@/server/supabase/server";

export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify Vercel Cron authentication
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const days = 1; // Report covers last 24 hours
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);

    // 1. Collect data
    const data = await collectAnalyticsData(days);

    // 2. Generate AI report
    const reportContent = await generateReport(data.formattedText);

    // 3. Store in Supabase
    const supabase = createSupabaseAdminClient();
    const { error: insertError } = await supabase.from("analytics_reports").insert({
      period_start: periodStart.toISOString(),
      period_end: now.toISOString(),
      report_type: "daily",
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

    return NextResponse.json({ ok: true, reportLength: reportContent.length });
  } catch (err: any) {
    console.error("Analytics report generation failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
