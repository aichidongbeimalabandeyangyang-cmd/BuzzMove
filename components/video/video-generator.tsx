"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getDeviceKey } from "@/components/tracking/device-key-ensurer";
import { CREDIT_COSTS } from "@/lib/constants";
import { useApp } from "@/components/layout/app-shell";
import { VideoProgress } from "./video-progress";
import { VideoPlayer } from "./video-player";

interface VideoGeneratorProps {
  imageUrl: string;
  imagePreview: string;
  onReset: () => void;
  initialPrompt?: string;
}

export function VideoGenerator({ imageUrl, imagePreview, onReset, initialPrompt }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [mode, setMode] = useState<"standard" | "professional">("standard");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const { user, openLogin, setHomeView } = useApp();

  // Sync homeView with current state
  useEffect(() => {
    if (videoId && status === "completed") {
      setHomeView("result");
    } else if (videoId && (status === "generating" || status === "submitting")) {
      setHomeView("progress");
    } else {
      setHomeView("generator");
    }
  }, [videoId, status, setHomeView]);

  const generateMutation = trpc.video.generate.useMutation({
    onSuccess(data) { setVideoId(data.videoId); setStatus("generating"); },
    onError() { setStatus("error"); },
  });

  const handleGenerate = () => {
    if (!user) { openLogin(); return; }
    setStatus("submitting");
    generateMutation.mutate({
      imageUrl,
      prompt: prompt || undefined,
      duration,
      mode,
      deviceKey: getDeviceKey() || undefined,
    });
  };

  const creditCost = CREDIT_COSTS[mode][parseInt(duration) as 5 | 10];

  // Show VideoPlayer when completed
  if (videoId && status === "completed") {
    return <VideoPlayer videoId={videoId} onReset={onReset} creditCost={creditCost} />;
  }

  // Show VideoProgress when generating
  if (videoId && (status === "generating" || status === "submitting")) {
    return (
      <VideoProgress
        videoId={videoId}
        imagePreview={imagePreview}
        onComplete={() => setStatus("completed")}
        onError={() => setStatus("error")}
      />
    );
  }

  // Generator form
  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Gen Content: h-fill, vertical, gap 16, padding [0,20,24,20] */}
      <div className="flex flex-1 flex-col gap-4 px-5 pb-6">
        {/* Image Preview: h280, cornerRadius 20, clip */}
        <div className="relative w-full shrink-0 overflow-hidden rounded-[20px] bg-[#16161A]" style={{ height: 280 }}>
          <Image src={imagePreview} alt="Upload preview" fill className="object-cover" unoptimized />
          {/* Close Button: 32x32, cornerRadius 100, fill #00000066, x:310 y:12 → top-right */}
          <button
            onClick={onReset}
            aria-label="Remove image"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40"
          >
            <X className="h-4 w-4 text-white" strokeWidth={1.5} />
          </button>
        </div>

        {/* Prompt Input: cornerRadius 16, fill #16161A, gap 8, padding 16 */}
        <div className="rounded-2xl bg-[#16161A] p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the motion you want..."
            maxLength={1000}
            rows={2}
            className="w-full resize-none bg-transparent text-sm leading-[1.4] text-[#FAFAF9] placeholder:text-[#6B6B70] outline-none"
          />
          {/* Char count: 12/400 #4A4A50, text-right */}
          <p className="mt-2 text-right text-xs text-[#4A4A50]">{prompt.length}/1000</p>
        </div>

        {/* Options Row: gap 12, horizontal */}
        <div className="flex gap-3">
          {/* Duration Column: gap 6 */}
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium text-[#6B6B70]">Duration</p>
            {/* Toggle: h44, cornerRadius 12, fill #16161A, padding 4 */}
            <div className="flex h-11 rounded-xl bg-[#16161A] p-1">
              {(["5", "10"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-lg text-sm transition-all ${
                    duration === d
                      ? "bg-[#E8A838] font-semibold text-[#0B0B0E]"
                      : "font-medium text-[#6B6B70]"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          {/* Quality Column: gap 6 */}
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium text-[#6B6B70]">Quality</p>
            <div className="flex h-11 rounded-xl bg-[#16161A] p-1">
              {(["standard", "professional"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg text-sm transition-all ${
                    mode === m
                      ? "bg-[#E8A838] font-semibold text-[#0B0B0E]"
                      : "font-medium text-[#6B6B70]"
                  }`}
                >
                  {m === "standard" ? "Std" : "Pro"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Generate Button: h56, cornerRadius 14, gradient + shadow */}
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="flex h-14 w-full shrink-0 items-center justify-center rounded-[14px] text-[17px] font-bold text-[#0B0B0E] transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            boxShadow: "0 4px 20px #E8A83840",
          }}
        >
          {generateMutation.isPending ? "Starting..." : !user ? "Sign in to Generate" : `Generate Video · ${creditCost} credits`}
        </button>

        {generateMutation.error && (
          <div className="rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-[#EF4444]">
            {generateMutation.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
