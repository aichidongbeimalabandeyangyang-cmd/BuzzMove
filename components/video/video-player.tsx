"use client";

import { trpc } from "@/lib/trpc";

interface VideoPlayerProps {
  videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const { data: video } = trpc.video.getStatus.useQuery({ videoId });

  if (!video?.output_video_url) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-[var(--secondary)]">
        <p className="text-sm text-[var(--muted-foreground)]">
          Video not ready
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
        <video
          src={video.output_video_url}
          controls
          autoPlay
          loop
          playsInline
          className="w-full"
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-[var(--muted-foreground)]">
          {video.duration}s &middot; {video.mode}
        </p>
        <a
          href={video.output_video_url}
          download
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--accent)] transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  );
}
