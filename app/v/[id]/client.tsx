"use client";

import { Sparkles, Play } from "lucide-react";

interface Props {
  videoUrl: string | null;
  imageUrl: string | null;
  prompt: string | null;
  duration: number | null;
  mode: string | null;
}

export function VideoShareClient({ videoUrl, imageUrl, prompt, duration, mode }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center" style={{ backgroundColor: "#0B0B0E" }}>
      {/* Video Player */}
      <div className="w-full lg:max-w-2xl" style={{ padding: "16px 16px 0 16px" }}>
        {videoUrl ? (
          <div className="relative w-full overflow-hidden" style={{ borderRadius: 20 }}>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full"
              style={{ borderRadius: 20, maxHeight: "70vh" }}
            />
          </div>
        ) : imageUrl ? (
          <div className="relative w-full overflow-hidden" style={{ borderRadius: 20 }}>
            <img src={imageUrl} alt="Video preview" className="w-full" style={{ borderRadius: 20, maxHeight: "70vh", objectFit: "contain" }} />
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="flex w-full flex-col items-center lg:max-w-2xl" style={{ padding: "20px 16px 32px 16px", gap: 16 }}>
        {/* Prompt */}
        {prompt && (
          <div className="w-full" style={{ borderRadius: 16, backgroundColor: "#16161A", padding: 16 }}>
            <div className="flex items-center" style={{ gap: 6, marginBottom: 8 }}>
              <Sparkles style={{ width: 14, height: 14, color: "#E8A838" }} strokeWidth={1.5} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#E8A838" }}>Motion Prompt</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: "#FAFAF9" }}>{prompt}</p>
          </div>
        )}

        {/* Meta badges */}
        <div className="flex items-center" style={{ gap: 8 }}>
          {duration && (
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70", borderRadius: 8, backgroundColor: "#16161A", padding: "4px 10px" }}>
              {duration}s
            </span>
          )}
          {mode && (
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70", borderRadius: 8, backgroundColor: "#16161A", padding: "4px 10px" }}>
              {mode}
            </span>
          )}
          <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70", borderRadius: 8, backgroundColor: "#16161A", padding: "4px 10px" }}>
            Made with BuzzMove
          </span>
        </div>

        {/* CTA */}
        <a
          href="/?ref=share"
          className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
          style={{
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            boxShadow: "0 4px 20px #E8A83840",
            textDecoration: "none",
            gap: 8,
          }}
        >
          <Play style={{ width: 18, height: 18, color: "#0B0B0E" }} fill="#0B0B0E" strokeWidth={0} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0B0B0E" }}>Create your own AI video</span>
        </a>

        {/* Branding */}
        <p style={{ fontSize: 12, color: "#4A4A50", textAlign: "center" }}>
          BuzzMove — Turn any photo into a stunning AI video
        </p>
      </div>
    </div>
  );
}
