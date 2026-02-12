import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { timingSafeEqual } from "crypto";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { persistVideoToStorage } from "@/server/services/video-persist";
import { sendVideoReadyEmail } from "@/server/services/email";
import type { KlingCallbackPayload } from "@/server/kling/types";

function isValidWebhookAuth(authHeader: string | null): boolean {
  const secret = process.env.KLING_WEBHOOK_SECRET;
  if (!secret || !authHeader) return false;
  const expected = `Bearer ${secret}`;
  if (authHeader.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  if (!isValidWebhookAuth(req.headers.get("authorization"))) {
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

    // Optimistic lock: only update if still generating
    const { data: updated } = await supabase
      .from("videos")
      .update({
        status: "completed",
        output_video_url: videoUrl,
        kling_video_url: videoUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", video.id)
      .eq("status", "generating")
      .select("id")
      .single();

    if (updated) {
      // Persist to Supabase Storage + send email for first video only
      after(async () => {
        await persistVideoToStorage(video.id, videoUrl);
        const { count } = await supabase
          .from("videos")
          .select("id", { count: "exact", head: true })
          .eq("user_id", video.user_id)
          .eq("status", "completed");
        if (count === 1) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", video.user_id)
            .single();
          if (profile?.email) {
            sendVideoReadyEmail(profile.email, video.id).catch((err) =>
              console.error("[kling-webhook] Email send failed:", err)
            );
          }
        }
      });
    }
  } else if (payload.task_status === "failed") {
    // Optimistic lock: only update and refund if still generating
    const { data: updated } = await supabase
      .from("videos")
      .update({ status: "failed", fail_reason: payload.task_status_msg || null })
      .eq("id", video.id)
      .eq("status", "generating")
      .select("id")
      .single();

    if (updated) {
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
  }

  return NextResponse.json({ received: true });
}
