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

  // Sync homeView for default and upload states
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

  // ---- VIDEO GENERATOR (includes progress + result via sub-components) ----
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
      /* photoPickerBody: gap 16, padding [16,16,12,16], h-fill */
      <div className="flex w-full flex-1 flex-col px-4 pt-4 pb-3">
        {uploading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-[#252530]" />
              <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[#E8A838]" />
            </div>
            <p className="text-sm text-[#6B6B70]">Uploading your image...</p>
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
      {/* Hero Photo: h460, width fill, clip, layout none */}
      <div
        className="relative w-full shrink overflow-hidden cursor-pointer min-h-[200px]"
        style={{ flex: "1 1 0%" }}
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
        <div className="absolute left-4 top-4 z-10">
          <span className="rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            Example photo · Tap to upload your own
          </span>
        </div>
        {/* Gradient Overlay: w390 h160, bottom, gradient 180deg */}
        <div
          className="absolute inset-x-0 bottom-0 h-[160px]"
          style={{ background: "linear-gradient(to top, #0B0B0E, transparent)" }}
        />
      </div>

      {/* Bottom Content: h-fill, vertical, gap 12, justify end, padding [0,20,24,20] */}
      <div className="flex shrink-0 flex-col gap-3 px-5 pb-6">
        {/* Prompt Label: gap 6, horizontal */}
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#E8A838]" strokeWidth={1.5} />
          <span className="text-[13px] font-semibold text-[#E8A838]">Motion Prompt</span>
        </div>

        {/* Prompt Card: cornerRadius 16, fill #16161A, padding 16 */}
        <div className="rounded-2xl bg-[#16161A] p-4">
          <p className="text-[15px] leading-[1.4] text-[#FAFAF9]">{currentExample.prompt}</p>
        </div>

        {/* Primary CTA: h52, cornerRadius 14, gradient + shadow */}
        <button
          onClick={handleExampleClick}
          className="flex h-[52px] w-full items-center justify-center rounded-[14px] text-base font-bold text-[#0B0B0E] transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            boxShadow: "0 4px 20px #E8A83840",
          }}
        >
          Make It Move · Free
        </button>

        {/* Secondary CTA: h48, cornerRadius 14, stroke 1.5px #2A2A2E */}
        <button
          onClick={() => setHomeView("upload")}
          className="flex h-12 w-full items-center justify-center rounded-[14px] text-[15px] font-medium text-[#FAFAF9] transition-all active:scale-[0.98]"
          style={{ border: "1.5px solid #2A2A2E" }}
        >
          Or upload your own photo
        </button>
      </div>
    </div>
  );
}
