import { createSupabaseAdminClient } from "@/server/supabase/server";

/**
 * Download video from Kling URL and persist to Supabase Storage.
 * Idempotent — skips if already persisted (output_video_url !== kling_video_url).
 */
export async function persistVideoToStorage(videoId: string, klingUrl: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();

    // Skip if already persisted (another request may have done it)
    const { data: current } = await adminSupabase
      .from("videos")
      .select("output_video_url, kling_video_url")
      .eq("id", videoId)
      .single();
    if (current?.kling_video_url && current.output_video_url !== current.kling_video_url) return;

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
  } catch (err) {
    console.error(`[persistVideo] Failed for ${videoId}:`, err);
  }
}
