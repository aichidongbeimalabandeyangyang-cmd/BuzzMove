"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { getDeviceKey } from "@/components/tracking/device-key-ensurer";
import { CREDIT_COSTS } from "@/lib/constants";
import { VideoProgress } from "./video-progress";
import { VideoPlayer } from "./video-player";

interface VideoGeneratorProps {
  imageUrl: string;
  imagePreview: string;
  onReset: () => void;
  initialPrompt?: string;
}

export function VideoGenerator({
  imageUrl,
  imagePreview,
  onReset,
  initialPrompt,
}: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [mode, setMode] = useState<"standard" | "professional">("standard");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const generateMutation = trpc.video.generate.useMutation({
    onSuccess(data) { setVideoId(data.videoId); setStatus("generating"); },
    onError() { setStatus("error"); },
  });

  const handleGenerate = () => {
    if (!isLoggedIn) { window.dispatchEvent(new CustomEvent("open-login")); return; }
    setStatus("submitting");
    generateMutation.mutate({ imageUrl, prompt: prompt || undefined, duration, mode, deviceKey: getDeviceKey() || undefined });
  };

  const creditCost = CREDIT_COSTS[mode][parseInt(duration) as 5 | 10];

  if (videoId && status === "completed") {
    return <VideoPlayer videoId={videoId} onReset={onReset} creditCost={creditCost} />;
  }

  if (videoId && (status === "generating" || status === "submitting")) {
    return <VideoProgress videoId={videoId} imagePreview={imagePreview} onComplete={() => setStatus("completed")} onError={() => setStatus("error")} />;
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Content area */}
      <div className="flex flex-1 flex-col gap-4 px-5 pb-6">
        {/* Image preview — ~33% of viewport, rounded-[20px] */}
        <div className="relative w-full shrink-0 overflow-hidden rounded-[20px] bg-[var(--card)]" style={{ height: "33vh" }}>
          <Image src={imagePreview} alt="Upload preview" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={onReset}
            aria-label="Remove image"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-all hover:bg-black/60 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prompt input */}
        <div className="rounded-2xl bg-[#16161A] p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the motion you want..."
            maxLength={1000}
            rows={2}
            className="w-full resize-none bg-transparent text-sm leading-[1.4] text-[var(--foreground)] placeholder:text-[#6B6B70] outline-none"
          />
          <p className="mt-1 text-right text-xs text-[#4A4A50]">{prompt.length}/1000</p>
        </div>

        {/* Options row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium text-[#6B6B70]">Duration</p>
            <div className="flex h-11 rounded-xl bg-[#16161A] p-1">
              {(["5", "10"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-lg text-sm font-medium transition-all ${
                    duration === d
                      ? "bg-[var(--primary)] text-[#0B0B0E]"
                      : "text-[#6B6B70] hover:text-[var(--foreground)]"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium text-[#6B6B70]">Quality</p>
            <div className="flex h-11 rounded-xl bg-[#16161A] p-1">
              {(["standard", "professional"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-[var(--primary)] text-[#0B0B0E]"
                      : "text-[#6B6B70] hover:text-[var(--foreground)]"
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

        {/* Generate button — h-14, full width */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="flex h-14 w-full shrink-0 items-center justify-center rounded-[14px] text-[17px] font-bold text-[#0B0B0E] transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            boxShadow: "0 4px 20px rgba(232,168,56,0.25)",
          }}
        >
          {generateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B0B0E30] border-t-[#0B0B0E]" />
              Starting...
            </span>
          ) : isLoggedIn === false ? (
            "Sign in to Generate"
          ) : (
            `Generate Video · ${creditCost} credits`
          )}
        </button>

        {generateMutation.error && (
          <div role="alert" className="rounded-xl bg-[var(--destructive-10)] px-4 py-3 text-center text-sm text-[var(--destructive)]">
            {generateMutation.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
