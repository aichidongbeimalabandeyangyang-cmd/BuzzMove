"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ImagePlus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/lib/constants";

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

export const VideoProgress = memo(function VideoProgress({ videoId, imagePreview, onComplete, onError }: VideoProgressProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!SUPPORTED_FORMATS.includes(file.type)) { alert("Please upload a JPEG, PNG, or WebP image."); return; }
    if (file.size > MAX_FILE_SIZE) { alert("File too large. Max 10MB."); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    fetch("/api/upload", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) router.push(`/?image=${encodeURIComponent(data.url)}`);
        else setUploading(false);
      })
      .catch(() => setUploading(false));
  };

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

  // Estimate based on duration (10s takes longer)
  const is10s = video?.duration === 10;
  const estimateText = is10s ? "1–3 minutes" : "30–60 seconds";

  // Tab title flashing when video completes while tab is hidden
  useEffect(() => {
    const originalTitle = document.title;
    let interval: ReturnType<typeof setInterval> | null = null;
    let listener: (() => void) | null = null;
    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (interval) clearInterval(interval);
      if (listener) document.removeEventListener("visibilitychange", listener);
      document.title = originalTitle;
    };

    if (video?.status === "completed") {
      if (document.hidden) {
        let flash = true;
        interval = setInterval(() => {
          document.title = flash ? "✅ Video Ready! — BuzzMove" : originalTitle;
          flash = !flash;
        }, 1000);
        listener = () => { cleanup(); };
        document.addEventListener("visibilitychange", listener);
      }
      onComplete();
      window.dispatchEvent(new Event("show-install-prompt"));
    }
    if (video?.status === "failed") {
      if (document.hidden) {
        document.title = "❌ Generation Failed — BuzzMove";
        listener = () => { cleanup(); };
        document.addEventListener("visibilitychange", listener);
      }
      onError();
    }

    return cleanup;
  }, [video?.status]);

  // Slower progress for 10s to avoid stalling at 92%
  const progressSpeed = is10s ? 0.5 : 1.2;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + progressSpeed;
        if (next >= 92) { clearInterval(interval); return 92; }
        return next;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [progressSpeed]);

  const currentStage = PROGRESS_STAGES.find((s) => progress < s.threshold) ?? PROGRESS_STAGES[PROGRESS_STAGES.length - 1];
  const pct = Math.round(Math.min(progress, 99));

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Progress Body: centered on desktop */}
      <div className="flex flex-1 flex-col items-center justify-center desktop-container" style={{ gap: 24, padding: "0 20px" }}>
        {/* Processing Image */}
        {imagePreview && (
          <div className="relative w-full overflow-hidden lg:max-w-lg" style={{ borderRadius: 20 }}>
            <img src={imagePreview} alt="Processing" className="w-full h-auto max-h-[45vh] lg:max-h-[65vh] object-contain" style={{ borderRadius: 20 }} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center" style={{ gap: 8, borderRadius: 100, backgroundColor: "#0B0B0ECC", padding: "8px 16px" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#FAFAF9" }}>✨ Processing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="w-full lg:max-w-lg" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 16, fontWeight: 700, color: "#E8A838" }}>{pct}%</span>
            <span style={{ fontSize: 13, fontWeight: 400, color: "#6B6B70" }}>{currentStage.label}</span>
          </div>
          <div className="w-full overflow-hidden" style={{ height: 6, borderRadius: 100, backgroundColor: "#1A1A1E" }}>
            <div
              className="transition-all duration-500 ease-out"
              style={{ height: "100%", width: `${pct}%`, borderRadius: 100, background: "linear-gradient(90deg, #F0C060, #E8A838)" }}
            />
          </div>
        </div>

        {/* Info Column */}
        <div className="w-full lg:max-w-lg" style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF9" }}>Creating your video...</p>
          <p style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.6, color: "#6B6B70" }}>
            This usually takes {estimateText}.{"\n"}You can keep browsing while we work.
          </p>
        </div>

        {/* Move Another Photo */}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePickFile} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center transition-all active:scale-[0.98] lg:max-w-sm"
          style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", gap: 8 }}
        >
          <ImagePlus style={{ width: 18, height: 18, color: "#E8A838" }} strokeWidth={1.5} />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>{uploading ? "Uploading..." : "Move Another Photo"}</span>
        </button>
      </div>

      {video?.status === "failed" && (
        <div style={{ margin: "0 20px 16px", borderRadius: 12, backgroundColor: "rgba(239,68,68,0.1)", padding: "12px 16px", textAlign: "center", fontSize: 14, color: "#EF4444" }}>
          Generation failed. Credits have been refunded.
        </div>
      )}
    </div>
  );
});
