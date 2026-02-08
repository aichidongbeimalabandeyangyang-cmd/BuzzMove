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

export function VideoProgress({ videoId, imagePreview, onComplete, onError }: VideoProgressProps) {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.2;
        if (next >= 92) { clearInterval(interval); return 92; }
        return next;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const currentStage = PROGRESS_STAGES.find((s) => progress < s.threshold) ?? PROGRESS_STAGES[PROGRESS_STAGES.length - 1];
  const pct = Math.round(Math.min(progress, 99));

  return (
    <div className="flex w-full flex-1 flex-col" role="status" aria-label="Generating video">
      {/* Content — centered vertically */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5">
        {/* Processing image — ~33% of viewport, responsive */}
        {imagePreview && (
          <div className="relative w-full overflow-hidden rounded-[20px]" style={{ height: "240px" }}>
            <Image src={imagePreview} alt="Processing" fill className="object-cover" unoptimized />
            {/* Processing badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-2 rounded-full bg-[#0B0B0ECC] px-4 py-2 backdrop-blur-sm">
                <span className="text-sm font-semibold text-[var(--foreground)]">✨ Processing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress section */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[var(--primary)]">{pct}%</span>
            <span className="text-[13px] text-[#6B6B70]">{currentStage.label}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1E]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #F0C060, #E8A838)" }}
            />
          </div>
        </div>

        {/* Info text */}
        <div className="w-full space-y-2 text-center">
          <p className="text-lg font-bold text-[var(--foreground)]">Creating your video...</p>
          <p className="text-[13px] leading-[1.6] text-[#6B6B70]">
            This usually takes 30–60 seconds.{"\n"}You can keep browsing while we work.
          </p>
        </div>

        {/* Back to Move button */}
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-[var(--foreground)] transition-all active:scale-[0.98]"
          style={{ border: "1.5px solid #252530" }}
        >
          <svg className="h-[18px] w-[18px] text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
          </svg>
          Back to Move
        </Link>
      </div>

      {video?.status === "failed" && (
        <div role="alert" className="mx-5 mb-4 rounded-xl bg-[var(--destructive-10)] px-4 py-3 text-center text-sm text-[var(--destructive)]">
          Generation failed. Credits have been refunded.
        </div>
      )}
    </div>
  );
}
