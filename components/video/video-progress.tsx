"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface VideoProgressProps {
  videoId: string;
  onComplete: () => void;
  onError: () => void;
}

const PROGRESS_STAGES = [
  { label: "Preparing your image...", duration: 5000 },
  { label: "Analyzing motion patterns...", duration: 8000 },
  { label: "AI is generating frames...", duration: 20000 },
  { label: "Assembling your video...", duration: 15000 },
  { label: "Almost there...", duration: 30000 },
];

export function VideoProgress({
  videoId,
  onComplete,
  onError,
}: VideoProgressProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const { data: video } = trpc.video.getStatus.useQuery(
    { videoId },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "completed" || status === "failed") return false;
        return 5000;
      },
    }
  );

  useEffect(() => {
    if (video?.status === "completed") onComplete();
    if (video?.status === "failed") onError();
  }, [video?.status]);

  // Simulated progress through stages
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.2;
        if (next >= 92) {
          clearInterval(interval);
          return 92;
        }
        return next;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Advance stage based on progress
  useEffect(() => {
    if (progress < 15) setStageIndex(0);
    else if (progress < 30) setStageIndex(1);
    else if (progress < 60) setStageIndex(2);
    else if (progress < 80) setStageIndex(3);
    else setStageIndex(4);
  }, [progress]);

  return (
    <div className="flex flex-col items-center gap-6 py-12 sm:py-16 animate-fade-up" role="status" aria-label="Generating video">
      {/* Animated ring */}
      <div className="relative h-24 w-24" aria-hidden="true">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48" cy="48" r="42"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
          />
          <circle
            cx="48" cy="48" r="42"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * Math.min(progress, 100)) / 100}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-[var(--foreground)]">
            {Math.round(Math.min(progress, 99))}%
          </span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-semibold tracking-tight">Creating your video</p>
        <p className="text-sm text-[var(--muted-foreground)] h-5 transition-all">
          {PROGRESS_STAGES[stageIndex].label}
        </p>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Usually takes 30-60 seconds
      </p>

      {video?.status === "failed" && (
        <div role="alert" className="rounded-xl bg-[var(--destructive-10)] px-4 py-3 text-sm text-[var(--destructive)]">
          Generation failed. Credits have been refunded.
        </div>
      )}
    </div>
  );
}
