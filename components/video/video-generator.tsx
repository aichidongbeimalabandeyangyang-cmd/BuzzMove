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
}

export function VideoGenerator({
  imageUrl,
  imagePreview,
  onReset,
}: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState("");
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

  // Show video player when complete
  if (videoId && status === "completed") {
    return (
      <div className="flex flex-col items-center gap-5 animate-fade-up">
        <VideoPlayer videoId={videoId} />
        <button
          onClick={onReset}
          className="rounded-xl border border-[var(--border)] px-6 py-2.5 text-sm font-medium transition-all hover:bg-[var(--secondary)] hover:border-[var(--muted-foreground)]"
        >
          Create Another
        </button>
      </div>
    );
  }

  // Show progress while generating
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
    <div className="mx-auto w-full max-w-lg">
      {/* Image preview with cinematic frame */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <img
          src={imagePreview}
          alt="Upload preview"
          className="w-full object-contain max-h-80"
        />
        {/* Subtle gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--card)] to-transparent" />
        <button
          onClick={onReset}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Prompt input */}
      <div className="relative mb-5">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the motion you want... (optional)"
          maxLength={1000}
          rows={3}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4 pr-12 text-sm transition-all placeholder:text-[var(--muted-foreground)]"
        />
        <span className="absolute bottom-3 right-3 text-[10px] tabular-nums text-[var(--muted-fg-50)]">
          {prompt.length}/1000
        </span>
      </div>

      {/* Options row */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">
            Duration
          </label>
          <div className="flex rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-1">
            {(["5", "10"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                  duration === d
                    ? "bg-[var(--primary)] text-[var(--background)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">
            Quality
          </label>
          <div className="flex rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-1">
            {(["standard", "professional"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                  mode === m
                    ? "bg-[var(--primary)] text-[var(--background)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {m === "standard" ? "Standard" : "Pro"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generateMutation.isPending}
        className="btn-primary w-full rounded-xl py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generateMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--background-30)] border-t-[var(--background)]" />
            Starting...
          </span>
        ) : (
          "Generate Video"
        )}
      </button>

      {generateMutation.error && (
        <div className="mt-4 rounded-lg bg-[var(--destructive-10)] px-4 py-3 text-center text-sm text-[var(--destructive)]">
          {generateMutation.error.message}
        </div>
      )}
    </div>
  );
}
