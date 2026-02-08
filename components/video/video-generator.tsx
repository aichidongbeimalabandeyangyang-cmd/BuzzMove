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

  useEffect(() => {
    if (videoId && status === "completed") setHomeView("result");
    else if (videoId && (status === "generating" || status === "submitting")) setHomeView("progress");
    else setHomeView("generator");
  }, [videoId, status, setHomeView]);

  const generateMutation = trpc.video.generate.useMutation({
    onSuccess(data) { setVideoId(data.videoId); setStatus("generating"); },
    onError() { setStatus("error"); },
  });

  const handleGenerate = () => {
    if (!user) { openLogin(); return; }
    setStatus("submitting");
    generateMutation.mutate({
      imageUrl, prompt: prompt || undefined, duration, mode,
      deviceKey: getDeviceKey() || undefined,
    });
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
      {/* Gen Content: h-fill, vertical, gap 16, padding [0,20,24,20] */}
      <div className="flex flex-1 flex-col" style={{ gap: 16, padding: "0 20px 24px 20px" }}>
        {/* Image Preview: h280, cornerRadius 20, clip */}
        <div className="relative w-full overflow-hidden" style={{ height: 280, borderRadius: 20, backgroundColor: "#16161A", flexShrink: 0 }}>
          <Image src={imagePreview} alt="Upload preview" fill className="object-cover" unoptimized />
          <button
            onClick={onReset}
            aria-label="Remove image"
            className="absolute flex items-center justify-center"
            style={{ right: 12, top: 12, width: 32, height: 32, borderRadius: 100, backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <X style={{ width: 16, height: 16, color: "#FFFFFF" }} strokeWidth={1.5} />
          </button>
        </div>

        {/* Prompt Input: cornerRadius 16, fill #16161A, gap 8, padding 16 */}
        <div style={{ borderRadius: 16, backgroundColor: "#16161A", padding: 16 }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the motion you want..."
            maxLength={1000}
            rows={2}
            className="w-full resize-none bg-transparent outline-none"
            style={{ fontSize: 14, lineHeight: 1.4, color: "#FAFAF9" }}
          />
          <p style={{ marginTop: 8, textAlign: "right", fontSize: 12, fontWeight: 400, color: "#4A4A50" }}>{prompt.length}/1000</p>
        </div>

        {/* Options Row: gap 12, horizontal */}
        <div className="flex" style={{ gap: 12 }}>
          {/* Duration */}
          <div className="flex-1">
            <p style={{ marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Duration</p>
            <div className="flex" style={{ height: 44, borderRadius: 12, backgroundColor: "#16161A", padding: 4 }}>
              {(["5", "10"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className="flex-1 flex items-center justify-center"
                  style={{
                    borderRadius: 8,
                    fontSize: 14, fontWeight: duration === d ? 600 : 500,
                    color: duration === d ? "#0B0B0E" : "#6B6B70",
                    backgroundColor: duration === d ? "#E8A838" : "transparent",
                  }}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          {/* Quality */}
          <div className="flex-1">
            <p style={{ marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Quality</p>
            <div className="flex" style={{ height: 44, borderRadius: 12, backgroundColor: "#16161A", padding: 4 }}>
              {(["standard", "professional"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 flex items-center justify-center"
                  style={{
                    borderRadius: 8,
                    fontSize: 14, fontWeight: mode === m ? 600 : 500,
                    color: mode === m ? "#0B0B0E" : "#6B6B70",
                    backgroundColor: mode === m ? "#E8A838" : "transparent",
                  }}
                >
                  {m === "standard" ? "Std" : "Pro"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Generate Button: h56, cornerRadius 14, gradient + shadow */}
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="flex w-full items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ height: 56, flexShrink: 0, borderRadius: 14, background: "linear-gradient(135deg, #F0C060, #E8A838)", boxShadow: "0 4px 20px #E8A83840" }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: "#0B0B0E" }}>
            {generateMutation.isPending ? "Starting..." : !user ? "Sign in to Generate" : `Generate Video · ${creditCost} credits`}
          </span>
        </button>

        {generateMutation.error && (
          <div style={{ borderRadius: 12, backgroundColor: "rgba(239,68,68,0.1)", padding: "12px 16px", textAlign: "center", fontSize: 14, color: "#EF4444" }}>
            {generateMutation.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
