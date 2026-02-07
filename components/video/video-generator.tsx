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
      <div className="flex flex-col items-center gap-4">
        <VideoPlayer videoId={videoId} />
        <button
          onClick={onReset}
          className="rounded-lg border border-[var(--border)] px-6 py-2 text-sm hover:bg-[var(--secondary)] transition-colors"
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
      {/* Image preview */}
      <div className="relative mb-6 overflow-hidden rounded-xl border border-[var(--border)]">
        <img
          src={imagePreview}
          alt="Upload preview"
          className="w-full object-contain max-h-80"
        />
        <button
          onClick={onReset}
          className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Prompt input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the motion you want... (optional)"
        maxLength={1000}
        rows={3}
        className="mb-4 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4 text-sm outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]"
      />

      {/* Options */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-[var(--muted-foreground)]">
            Duration
          </label>
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {(["5", "10"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  duration === d
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-[var(--secondary)]"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-[var(--muted-foreground)]">
            Quality
          </label>
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {(["standard", "professional"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  mode === m
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-[var(--secondary)]"
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
        className="w-full rounded-xl bg-[var(--primary)] py-4 text-base font-semibold text-white hover:bg-[var(--accent)] disabled:opacity-50 transition-all active:scale-[0.98]"
      >
        {generateMutation.isPending ? "Starting..." : "Generate Video"}
      </button>

      {generateMutation.error && (
        <p className="mt-3 text-center text-sm text-[var(--destructive)]">
          {generateMutation.error.message}
        </p>
      )}
    </div>
  );
}
