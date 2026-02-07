"use client";

import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface VideoProgressProps {
  videoId: string;
  onComplete: () => void;
  onError: () => void;
}

export function VideoProgress({
  videoId,
  onComplete,
  onError,
}: VideoProgressProps) {
  const { data: video } = trpc.video.getStatus.useQuery(
    { videoId },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "completed" || status === "failed") return false;
        return 5000; // Poll every 5 seconds
      },
    }
  );

  useEffect(() => {
    if (video?.status === "completed") onComplete();
    if (video?.status === "failed") onError();
  }, [video?.status]);

  return (
    <div className="flex flex-col items-center gap-8 py-16 animate-fade-up">
      {/* Cinematic spinner */}
      <div className="relative h-24 w-24">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
        {/* Spinning gold arc */}
        <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[var(--primary)]" />
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-[var(--primary)] animate-pulse-glow" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl font-semibold tracking-tight">Creating your video</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          This usually takes 30-60 seconds
        </p>
      </div>

      {/* Progress hints */}
      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--secondary)] px-4 py-2">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
        <span className="text-xs text-[var(--muted-foreground)]">
          AI is generating frames...
        </span>
      </div>

      {video?.status === "failed" && (
        <div className="rounded-lg bg-[var(--destructive-10)] px-4 py-3 text-sm text-[var(--destructive)]">
          Generation failed. Credits have been refunded.
        </div>
      )}
    </div>
  );
}
