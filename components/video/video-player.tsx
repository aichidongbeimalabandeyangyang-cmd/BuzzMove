"use client";

import { trpc } from "@/lib/trpc";

interface VideoPlayerProps {
  videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
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

  return (
    <div className="w-full max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-black/20">
        <video
          src={video.output_video_url}
          controls
          autoPlay
          loop
          playsInline
          className="w-full"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
            {video.duration}s
          </span>
          <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] capitalize">
            {video.mode}
          </span>
        </div>
        <a
          href={video.output_video_url}
          download
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </a>
      </div>
    </div>
  );
}
