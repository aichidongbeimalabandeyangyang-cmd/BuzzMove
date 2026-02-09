import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { persistVideoToStorage } from "@/server/services/video-persist";
import type { KlingCallbackPayload } from "@/server/kling/types";

export async function POST(req: NextRequest) {
  // Verify webhook token
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const expectedToken = process.env.KLING_WEBHOOK_SECRET;

  if (expectedToken && token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: KlingCallbackPayload = await req.json();
  const supabase = createSupabaseAdminClient();

  // Look up the video by kling_task_id
  const { data: video } = await supabase
    .from("videos")
    .select("id, user_id, credits_consumed, status")
    .eq("kling_task_id", payload.task_id)
    .single();

  // Ignore if task not found or already in terminal state
  if (!video || video.status === "completed" || video.status === "failed") {
    return NextResponse.json({ received: true });
  }

  if (payload.task_status === "succeed" && payload.task_result?.videos?.[0]) {
    const videoUrl = payload.task_result.videos[0].url;

    await supabase
      .from("videos")
      .update({
        status: "completed",
        output_video_url: videoUrl,
        kling_video_url: videoUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    // Persist to Supabase Storage after response is sent
    after(() => persistVideoToStorage(video.id, videoUrl));
  } else if (payload.task_status === "failed") {
    await supabase
      .from("videos")
      .update({ status: "failed" })
      .eq("id", video.id);

    // Atomic credit refund
    await supabase.rpc("refund_credits", {
      p_user_id: video.user_id,
      p_amount: video.credits_consumed,
    });

    await supabase.from("credit_transactions").insert({
      user_id: video.user_id,
      amount: video.credits_consumed,
      type: "refund",
      description: "Refund: video generation failed",
      video_id: video.id,
    });
  }

  return NextResponse.json({ received: true });
}
