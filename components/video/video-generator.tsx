"use client";

import { useState } from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import { getDeviceKey } from "@/components/tracking/device-key-ensurer";
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

  const generateMutation = trpc.video.generate.useMutation({
    onSuccess(data) {
      setVideoId(data.videoId);
      setStatus("generating");
    },
    onError(error) {
      setStatus("error");
    },
  });

  const handleGenerate = () => {
    setStatus("submitting");
    generateMutation.mutate({
      imageUrl,
      prompt: prompt || undefined,
      duration,
      mode,
      deviceKey: getDeviceKey() || undefined,
    });
  };

  if (videoId && status === "completed") {
    return (
      <div className="flex flex-col items-center gap-5 animate-fade-up">
        <VideoPlayer videoId={videoId} />
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl bg-[var(--secondary)] px-6 py-3 text-sm font-medium transition-all active:scale-[0.98] hover:bg-[var(--primary-10)] hover:text-[var(--primary)]"
        >
          Create Another
        </button>
      </div>
    );
  }

  if (videoId && (status === "generating" || status === "submitting")) {
    return (
      <VideoProgress
        videoId={videoId}
        onComplete={() => setStatus("completed")}
        onError={() => setStatus("error")}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg pb-24 sm:pb-0">
      {/* Image preview */}
      <div className="relative mb-5 overflow-hidden rounded-2xl bg-[var(--card)]">
        <Image
          src={imagePreview}
          alt="Upload preview"
          width={512}
          height={640}
          className="w-full object-contain max-h-72 sm:max-h-96"
          unoptimized
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--card)] to-transparent" />
        <button
          type="button"
          onClick={onReset}
          aria-label="Remove image"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Prompt input */}
      <div className="relative mb-4">
        <label htmlFor="motion-prompt" className="sr-only">Describe the motion you want</label>
        <textarea
          id="motion-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the motion you want... (optional)"
          maxLength={1000}
          rows={2}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-3.5 pr-12 text-sm leading-relaxed transition-all placeholder:text-[var(--muted-foreground)]"
        />
        <span className="absolute bottom-2.5 right-3 text-[10px] tabular-nums text-[var(--muted-foreground)]" aria-hidden="true">
          {prompt.length}/1000
        </span>
      </div>

      {/* Options row */}
      <div className="mb-5 flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
            Duration
          </label>
          <div className="flex rounded-xl bg-[var(--secondary)] p-1" role="radiogroup" aria-label="Duration">
            {(["5", "10"] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={duration === d}
                onClick={() => setDuration(d)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  duration === d
                    ? "bg-[var(--primary)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
            Quality
          </label>
          <div className="flex rounded-xl bg-[var(--secondary)] p-1" role="radiogroup" aria-label="Quality">
            {(["standard", "professional"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition-all ${
                  mode === m
                    ? "bg-[var(--primary)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {m === "standard" ? "Standard" : "Pro"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button — sticky on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent sm:static sm:p-0 sm:bg-none">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          aria-busy={generateMutation.isPending}
          className="w-full rounded-xl py-4 text-base font-semibold text-[var(--background)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)" }}
        >
          {generateMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--background-30)] border-t-[var(--background)]" aria-hidden="true" />
              Starting...
            </span>
          ) : (
            "Generate Video"
          )}
        </button>
      </div>

      {generateMutation.error && (
        <div role="alert" className="mt-4 rounded-xl bg-[var(--destructive-10)] px-4 py-3 text-center text-sm text-[var(--destructive)]">
          {generateMutation.error.message}
        </div>
      )}
    </div>
  );
}
