"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useApp } from "@/components/layout/app-shell";
import { UploadZone, saveRecentUpload } from "@/components/upload/upload-zone";
import { VideoGenerator } from "@/components/video/video-generator";
import { HERO_EXAMPLES } from "@/lib/constants";

export default function HomePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { homeView, setHomeView } = useApp();

  const showUpload = homeView === "upload";

  useEffect(() => {
    if (!imageUrl && !imagePreview && homeView !== "upload") {
      setHomeView("home");
    }
  }, [imageUrl, imagePreview]);

  const handleFileSelected = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url);
      saveRecentUpload(data.url, file.name);
    } catch (err) {
      URL.revokeObjectURL(preview);
      setImagePreview(null);
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setInitialPrompt("");
    setUploadError(null);
    setHomeView("home");
  };

  const currentExample = HERO_EXAMPLES[0];

  const handleExampleClick = () => {
    const fullUrl = `${window.location.origin}${currentExample.image}`;
    setImageUrl(fullUrl);
    setImagePreview(currentExample.image);
    setInitialPrompt(currentExample.prompt);
  };

  // ---- VIDEO GENERATOR ----
  if (imageUrl && imagePreview) {
    return (
      <VideoGenerator
        imageUrl={imageUrl}
        imagePreview={imagePreview}
        onReset={handleReset}
        initialPrompt={initialPrompt}
      />
    );
  }

  // ---- UPLOAD PHOTO ----
  if (showUpload) {
    return (
      <div className="flex w-full flex-1 flex-col" style={{ padding: "16px 16px 12px 16px" }}>
        {uploading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-[#252530]" />
              <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[#E8A838]" />
            </div>
            <p style={{ fontSize: 14, color: "#6B6B70" }}>Uploading your image...</p>
          </div>
        ) : (
          <UploadZone onFileSelected={handleFileSelected} />
        )}
        {uploadError && (
          <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-[#EF4444]">
            {uploadError}
          </div>
        )}
      </div>
    );
  }

  // ---- DEFAULT HOMEPAGE ----
  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Hero Photo: height 460 FIXED, width fill, clip, layout none */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 460, flexShrink: 0 }}
        onClick={() => setHomeView("upload")}
      >
        <Image
          src={currentExample.image}
          alt={currentExample.label}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Label Badge: x16 y16, cornerRadius 100, fill #00000099, padding [6,14] */}
        <div
          className="absolute"
          style={{ left: 16, top: 16, zIndex: 10, borderRadius: 100, backgroundColor: "#00000099", padding: "6px 14px" }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFFCC", whiteSpace: "nowrap" }}>
            Example photo · Tap to upload your own
          </span>
        </div>
        {/* Gradient Overlay: bottom, h160, gradient 180deg (#0B0B0E00 → #0B0B0E) */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: 160, background: "linear-gradient(180deg, #0B0B0E00, #0B0B0E)" }}
        />
      </div>

      {/* Bottom Content: h-fill, vertical, gap 12, justifyContent end, padding [0,20,24,20] */}
      <div
        className="flex w-full flex-col"
        style={{ flex: "1 1 0%", gap: 12, justifyContent: "flex-end", padding: "0 20px 24px 20px" }}
      >
        {/* Prompt Label: gap 6, horizontal, center */}
        <div className="flex items-center" style={{ gap: 6 }}>
          <Sparkles style={{ width: 16, height: 16, color: "#E8A838" }} strokeWidth={1.5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#E8A838" }}>Motion Prompt</span>
        </div>

        {/* Prompt Card: cornerRadius 16, fill #16161A, padding 16, width fill */}
        <div style={{ borderRadius: 16, backgroundColor: "#16161A", padding: 16, width: "100%" }}>
          <p style={{ fontSize: 15, lineHeight: 1.4, color: "#FAFAF9" }}>
            {currentExample.prompt}
          </p>
        </div>

        {/* Primary CTA: h52, cornerRadius 14, gradient + shadow, width fill */}
        <button
          onClick={handleExampleClick}
          className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
          style={{
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            boxShadow: "0 4px 20px #E8A83840",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0B0B0E" }}>Make It Move · Free</span>
        </button>

        {/* Secondary CTA: h48, cornerRadius 14, stroke 1.5px #2A2A2E, width fill */}
        <button
          onClick={() => setHomeView("upload")}
          className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
          style={{ height: 48, borderRadius: 14, border: "1.5px solid #2A2A2E" }}
        >
          <span style={{ fontSize: 15, fontWeight: 500, color: "#FAFAF9" }}>Or upload your own photo</span>
        </button>
      </div>
    </div>
  );
}
