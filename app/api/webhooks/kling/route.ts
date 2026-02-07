import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import type { KlingCallbackPayload } from "@/server/kling/types";

export async function POST(req: NextRequest) {
  const payload: KlingCallbackPayload = await req.json();
  const supabase = createSupabaseAdminClient();

  if (payload.task_status === "succeed" && payload.task_result?.videos?.[0]) {
    const videoUrl = payload.task_result.videos[0].url;

    await supabase
      .from("videos")
      .update({
        status: "completed",
        output_video_url: videoUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("kling_task_id", payload.task_id);
  } else if (payload.task_status === "failed") {
    // Mark as failed and refund credits
    const { data: video } = await supabase
      .from("videos")
      .select("user_id, credits_consumed")
      .eq("kling_task_id", payload.task_id)
      .single();

    await supabase
      .from("videos")
      .update({ status: "failed" })
      .eq("kling_task_id", payload.task_id);

    // Refund credits
    if (video) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits_balance")
        .eq("id", video.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            credits_balance: profile.credits_balance + video.credits_consumed,
          })
          .eq("id", video.user_id);

        await supabase.from("credit_transactions").insert({
          user_id: video.user_id,
          amount: video.credits_consumed,
          type: "purchase",
          description: "Refund: video generation failed",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
