"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

interface VideoProgressProps {
  videoId: string;
  imagePreview?: string;
  onComplete: () => void;
  onError: () => void;
}

const PROGRESS_STAGES = [
  { label: "Preparing your image...", threshold: 15 },
  { label: "Analyzing motion patterns...", threshold: 30 },
  { label: "Generating frames...", threshold: 60 },
  { label: "Assembling your video...", threshold: 80 },
  { label: "Almost there...", threshold: 100 },
];

export function VideoProgress({
  videoId,
  imagePreview,
  onComplete,
  onError,
}: VideoProgressProps) {
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

  const currentStage = PROGRESS_STAGES.find((s) => progress < s.threshold) ?? PROGRESS_STAGES[PROGRESS_STAGES.length - 1];
  const progressPercent = Math.round(Math.min(progress, 99));

  return (
    <div className="flex flex-col items-center gap-6 py-8 sm:py-12 animate-fade-up" role="status" aria-label="Generating video">
      {/* Image preview with processing overlay */}
      {imagePreview && (
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden">
          <Image
            src={imagePreview}
            alt="Processing"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-2">
              <svg className="h-4 w-4 text-[var(--primary)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <span className="text-sm font-medium text-white">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal progress bar */}
      <div className="w-full max-w-xs space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[var(--foreground)]">Creating your video</span>
          <span className="font-semibold tabular-nums text-[var(--primary)]">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--secondary)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #e8a838, #f0c060)",
            }}
          />
        </div>
        <p className="text-sm text-[var(--muted-foreground)] text-center h-5 transition-all">
          {currentStage.label}
        </p>
      </div>

      <p className="text-xs text-[var(--muted-foreground)] text-center">
        Usually takes 30–60 seconds. You can keep browsing while we work.
      </p>

      {/* Back to Move button */}
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-5 py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--primary-40)] hover:bg-[var(--primary-10)] hover:text-[var(--primary)] active:scale-[0.98]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
        </svg>
        Back to Move
      </Link>

      {video?.status === "failed" && (
        <div role="alert" className="rounded-xl bg-[var(--destructive-10)] px-4 py-3 text-sm text-[var(--destructive)]">
          Generation failed. Credits have been refunded.
        </div>
      )}
    </div>
  );
}
