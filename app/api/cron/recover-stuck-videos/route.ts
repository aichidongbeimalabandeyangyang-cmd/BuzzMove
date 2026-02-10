import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { getTaskStatus } from "@/server/kling/client";
import { persistVideoToStorage } from "@/server/services/video-persist";
import { sendVideoReadyEmail } from "@/server/services/email";

export const maxDuration = 60;

function isValidCronAuth(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authHeader) return false;
  const expected = `Bearer ${secret}`;
  if (authHeader.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
}

export async function GET(request: Request) {
  if (!isValidCronAuth(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  // Find videos stuck in generating/pending for > 10 minutes
  const { data: stuckVideos } = await supabase
    .from("videos")
    .select("id, user_id, kling_task_id, credits_consumed, status, created_at")
    .in("status", ["generating", "pending"])
    .lt("created_at", tenMinAgo)
    .limit(50);

  if (!stuckVideos || stuckVideos.length === 0) {
    return NextResponse.json({ recovered: 0, failed: 0, timedOut: 0 });
  }

  let recovered = 0;
  let failed = 0;
  let timedOut = 0;

  for (const video of stuckVideos) {
    // Force-fail videos older than 2 hours (Kling will never complete these)
    if (video.created_at < twoHoursAgo) {
      // Optimistic lock: only update if still in active state
      const { data: updated } = await supabase
        .from("videos")
        .update({ status: "failed" })
        .eq("id", video.id)
        .in("status", ["generating", "pending"])
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
          description: "Refund: video generation timed out (auto-recovery)",
          video_id: video.id,
        });
        timedOut++;
      }
      continue;
    }

    // Pending without kling_task_id = server crashed before Kling call.
    // Force-fail after 30 min to unblock concurrent slot (instead of waiting 2h).
    if (!video.kling_task_id) {
      if (video.created_at < thirtyMinAgo) {
        const { data: updated } = await supabase
          .from("videos")
          .update({ status: "failed" })
          .eq("id", video.id)
          .eq("status", "pending")
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
            description: "Refund: video stuck in pending (auto-recovery)",
            video_id: video.id,
          });
          timedOut++;
        }
      }
      continue;
    }

    try {
      const result = await getTaskStatus(video.kling_task_id);
      const klingStatus = result.data.task_status;

      if (klingStatus === "succeed" && result.data.task_result?.videos?.[0]) {
        const videoUrl = result.data.task_result.videos[0].url;

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
          persistVideoToStorage(video.id, videoUrl).catch(() => {});
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
              sendVideoReadyEmail(profile.email, video.id).catch(() => {});
            }
          }
          recovered++;
        }
      } else if (klingStatus === "failed") {
        const { data: updated } = await supabase
          .from("videos")
          .update({ status: "failed" })
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
            description: "Refund: video generation failed (auto-recovery)",
            video_id: video.id,
          });
          failed++;
        }
      }
      // Still processing on Kling side — skip, will retry next cron run
    } catch (err) {
      console.error(`[recover-stuck] Error checking task ${video.kling_task_id}:`, err);
    }
  }

  return NextResponse.json({ recovered, failed, timedOut, checked: stuckVideos.length });
}
