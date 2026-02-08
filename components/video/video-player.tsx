"use client";

import { Download, Share2, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface VideoPlayerProps {
  videoId: string;
  onReset?: () => void;
  creditCost?: number;
}

export function VideoPlayer({ videoId, onReset, creditCost }: VideoPlayerProps) {
  const { data: video } = trpc.video.getStatus.useQuery({ videoId });

  if (!video?.output_video_url) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <p style={{ fontSize: 14, color: "#6B6B70" }}>Video not ready</p>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Check out my AI video!", url: video.output_video_url }); } catch {}
    } else {
      await navigator.clipboard.writeText(video.output_video_url);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Result Body: h-fill, vertical, gap 20, padding [8,20,20,20] */}
      <div className="flex flex-1 flex-col" style={{ gap: 20, padding: "8px 20px 20px 20px" }}>
        {/* Video Player: h440, cornerRadius 20 */}
        <div className="relative w-full overflow-hidden" style={{ height: 440, borderRadius: 20, flexShrink: 0 }}>
          <video src={video.output_video_url} controls autoPlay loop playsInline className="h-full w-full object-cover" />
        </div>

        {/* Action Row: gap 10 */}
        <div className="flex" style={{ gap: 10 }}>
          {/* Download: h48, cornerRadius 14, gradient + shadow, gap 8 */}
          <a
            href={video.output_video_url}
            download
            className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
            style={{ height: 48, borderRadius: 14, gap: 8, background: "linear-gradient(135deg, #F0C060, #E8A838)", boxShadow: "0 4px 20px #E8A83840" }}
          >
            <Download style={{ width: 20, height: 20, color: "#0B0B0E" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0B0B0E" }}>Download</span>
          </a>
          {/* Share: h48, cornerRadius 14, stroke 1.5px #252530, gap 8 */}
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
            style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", gap: 8 }}
          >
            <Share2 style={{ width: 20, height: 20, color: "#FAFAF9" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Share</span>
          </button>
        </div>

        {/* Regenerate: h48, cornerRadius 14, stroke 1.5px #252530, gap 8 */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
            style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", gap: 8 }}
          >
            <RefreshCw style={{ width: 18, height: 18, color: "#FAFAF9" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Regenerate · {creditCost || 300} credits</span>
          </button>
        )}
      </div>
    </div>
  );
}
