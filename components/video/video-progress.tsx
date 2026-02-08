"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Flame } from "lucide-react";
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
    <div className="flex w-full flex-1 flex-col">
      {/* Progress Body: h-fill, vertical, gap 24, justify center, padding [0,20] */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5">
        {/* Processing Image: h280, cornerRadius 20, clip */}
        {imagePreview && (
          <div className="relative w-full overflow-hidden rounded-[20px]" style={{ height: 280 }}>
            <Image src={imagePreview} alt="Processing" fill className="object-cover" unoptimized />
            {/* Badge: centered, cornerRadius 100, fill #0B0B0ECC, padding [8,16], gap 8 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-2 rounded-full bg-[#0B0B0ECC] px-4 py-2 backdrop-blur-sm">
                <span className="text-sm font-semibold text-[#FAFAF9]">✨ Processing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Section: gap 10 */}
        <div className="w-full space-y-2.5">
          {/* Row: space-between */}
          <div className="flex items-center justify-between">
            {/* Percentage: 16/700 #E8A838 */}
            <span className="text-base font-bold text-[#E8A838]">{pct}%</span>
            {/* Stage: 13/400 #6B6B70 */}
            <span className="text-[13px] text-[#6B6B70]">{currentStage.label}</span>
          </div>
          {/* Bar: h6, cornerRadius 100, fill #1A1A1E */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1E]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #F0C060, #E8A838)" }}
            />
          </div>
        </div>

        {/* Info Column: gap 8, center */}
        <div className="w-full space-y-2 text-center">
          {/* Title: 18/700 #FAFAF9 */}
          <p className="text-lg font-bold text-[#FAFAF9]">Creating your video...</p>
          {/* Desc: 13/400 #6B6B70, lineHeight 1.6 */}
          <p className="text-[13px] leading-[1.6] text-[#6B6B70]">
            This usually takes 30–60 seconds.{"\n"}You can keep browsing while we work.
          </p>
        </div>

        {/* Back to Move: h48, cornerRadius 14, stroke 1.5px #252530, gap 8 */}
        <button
          onClick={() => window.location.href = "/"}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-[#FAFAF9] transition-all active:scale-[0.98]"
          style={{ border: "1.5px solid #252530" }}
        >
          <Flame className="h-[18px] w-[18px] text-[#E8A838]" strokeWidth={1.5} />
          Back to Move
        </button>
      </div>

      {video?.status === "failed" && (
        <div className="mx-5 mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-[#EF4444]">
          Generation failed. Credits have been refunded.
        </div>
      )}
    </div>
  );
}
