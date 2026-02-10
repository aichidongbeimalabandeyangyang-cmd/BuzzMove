import { createSupabaseAdminClient } from "@/server/supabase/server";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Download video from Kling URL and persist to Supabase Storage.
 * Retries up to MAX_RETRIES times on failure.
 * Idempotent — skips if already persisted (output_video_url !== kling_video_url).
 */
export async function persistVideoToStorage(videoId: string, klingUrl: string) {
  const adminSupabase = createSupabaseAdminClient();

  // Skip if already persisted (another request may have done it)
  const { data: current } = await adminSupabase
    .from("videos")
    .select("output_video_url, kling_video_url")
    .eq("id", videoId)
    .single();
  if (current?.kling_video_url && current.output_video_url !== current.kling_video_url) return;

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) await sleep(RETRY_DELAY_MS * attempt);

      const res = await fetch(klingUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());

      const fileName = `${videoId}-${Date.now()}.mp4`;
      const { data, error } = await adminSupabase.storage
        .from("uploads")
        .upload(`videos/${fileName}`, buffer, {
          contentType: "video/mp4",
          cacheControl: "31536000",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = adminSupabase.storage.from("uploads").getPublicUrl(data.path);

      await adminSupabase
        .from("videos")
        .update({ output_video_url: publicUrl })
        .eq("id", videoId);

      return; // Success
    } catch (err) {
      lastError = err;
      console.error(`[persistVideo] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for ${videoId}:`, err);
    }
  }

  console.error(`[persistVideo] All retries exhausted for ${videoId}:`, lastError);
}
