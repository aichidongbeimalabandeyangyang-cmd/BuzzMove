"use client";

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
      <div className="mx-auto flex w-full max-w-[390px] flex-1 items-center justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">Video not ready</p>
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
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-2">
        {/* Video player — 440px, rounded-[20px] */}
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

        {/* Download + Share side by side */}
        <div className="flex gap-2.5">
          <a
            href={video.output_video_url}
            download
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold text-[#0B0B0E] transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #F0C060, #E8A838)",
              boxShadow: "0 4px 20px rgba(232,168,56,0.25)",
            }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </a>
          <button
            type="button"
            onClick={handleShare}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-[var(--foreground)] transition-all active:scale-[0.98]"
            style={{ border: "1.5px solid #252530" }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share
          </button>
        </div>

        {/* Regenerate — full width */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-[var(--foreground)] transition-all active:scale-[0.98]"
            style={{ border: "1.5px solid #252530" }}
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Regenerate · {creditCost || 300} credits
          </button>
        )}
      </div>
    </div>
  );
}
