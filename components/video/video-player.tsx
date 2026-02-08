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
      <div className="flex h-64 items-center justify-center rounded-2xl bg-[var(--secondary)]">
        <p className="text-sm text-[var(--muted-foreground)]">
          Video not ready
        </p>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out my AI video!",
          url: video.output_video_url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(video.output_video_url);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Video player */}
      <div
        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
      >
        <video
          src={video.output_video_url}
          controls
          autoPlay
          loop
          playsInline
          className="w-full"
        />
      </div>

      {/* Meta tags */}
      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-lg bg-[var(--secondary)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted-foreground)]">
          {video.duration}s
        </span>
        <span className="rounded-lg bg-[var(--secondary)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted-foreground)] capitalize">
          {video.mode}
        </span>
        <span className="rounded-lg bg-[var(--secondary)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted-foreground)]">
          {video.credits_consumed} credits
        </span>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-col gap-2.5">
        {/* Primary: Download */}
        <a
          href={video.output_video_url}
          download
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-[var(--background)] transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)", boxShadow: "0 2px 16px rgba(232,168,56,0.2)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </a>

        {/* Secondary row: Share + Regenerate */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--primary-40)] hover:bg-[var(--primary-10)] active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share
          </button>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--primary-40)] hover:bg-[var(--primary-10)] active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Regenerate{creditCost ? ` · ${creditCost} cr` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
