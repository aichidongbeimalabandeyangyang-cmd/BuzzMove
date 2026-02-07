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
    <div className="flex flex-col items-center gap-6 py-12">
      {/* Animated spinner */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--primary)]" />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold">Generating your video...</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          This usually takes 30-60 seconds
        </p>
      </div>

      {video?.status === "failed" && (
        <p className="text-sm text-[var(--destructive)]">
          Generation failed. Credits have been refunded.
        </p>
      )}
    </div>
  );
}
