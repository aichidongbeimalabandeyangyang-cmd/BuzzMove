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
        <p className="text-sm text-[#6B6B70]">Video not ready</p>
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
      <div className="flex flex-1 flex-col gap-5 px-5 pt-2 pb-5">
        {/* Video Player: h440, cornerRadius 20 */}
        <div className="relative w-full shrink-0 overflow-hidden rounded-[20px]" style={{ height: 440 }}>
          <video
            src={video.output_video_url}
            controls
            autoPlay
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        </div>

        {/* Action Row: gap 10, horizontal */}
        <div className="flex gap-2.5">
          {/* Download: h48, cornerRadius 14, gradient + shadow, gap 8 */}
          <a
            href={video.output_video_url}
            download
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold text-[#0B0B0E] transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #F0C060, #E8A838)",
              boxShadow: "0 4px 20px #E8A83840",
            }}
          >
            <Download className="h-5 w-5" strokeWidth={1.5} />
            Download
          </a>
          {/* Share: h48, cornerRadius 14, stroke 1.5px #252530, gap 8 */}
          <button
            onClick={handleShare}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-[#FAFAF9] transition-all active:scale-[0.98]"
            style={{ border: "1.5px solid #252530" }}
          >
            <Share2 className="h-5 w-5" strokeWidth={1.5} />
            Share
          </button>
        </div>

        {/* Regenerate: h48, cornerRadius 14, stroke 1.5px #252530, gap 8 */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-[#FAFAF9] transition-all active:scale-[0.98]"
            style={{ border: "1.5px solid #252530" }}
          >
            <RefreshCw className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Regenerate · {creditCost || 300} credits
          </button>
        )}
      </div>
    </div>
  );
}
