"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadZone, saveRecentUpload } from "@/components/upload/upload-zone";
import { VideoGenerator } from "@/components/video/video-generator";
import { HERO_EXAMPLES } from "@/lib/constants";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleFileSelected = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setSelectedFile(file);
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
      console.error("Upload failed:", err);
      setSelectedFile(null);
      if (imagePreview) URL.revokeObjectURL(preview);
      setImagePreview(null);
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImageUrl(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setInitialPrompt("");
    setUploadError(null);
    setShowUpload(false);
  };

  const currentExample = HERO_EXAMPLES[0];

  const handleExampleClick = () => {
    const fullUrl = `${window.location.origin}${currentExample.image}`;
    setImageUrl(fullUrl);
    setImagePreview(currentExample.image);
    setInitialPrompt(currentExample.prompt);
  };

  // Show VideoGenerator when image is ready
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

  // Show upload zone (photo picker)
  if (showUpload) {
    return (
      <div className="flex w-full flex-1 flex-col px-5 py-4">
        {uploading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <div className="relative h-12 w-12" role="status" aria-label="Uploading image">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
              <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[var(--primary)]" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">Uploading your image...</p>
          </div>
        ) : (
          <UploadZone onFileSelected={handleFileSelected} />
        )}

        {uploadError && (
          <div role="alert" className="mt-4 rounded-xl bg-[var(--destructive-10)] px-4 py-3 text-center text-sm text-[var(--destructive)]">
            {uploadError}
          </div>
        )}

        <button
          type="button"
          onClick={() => { setShowUpload(false); setUploadError(null); }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
      </div>
    );
  }

  // Default: Hero view — full width, responsive
  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Hero Photo — takes available space minus bottom content */}
      <div
        className="relative w-full shrink overflow-hidden cursor-pointer min-h-[200px]"
        style={{ flex: "1 1 0%" }}
        onClick={() => setShowUpload(true)}
      >
        <Image
          src={currentExample.image}
          alt={currentExample.label}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />

        {/* Label badge overlay */}
        <div className="absolute left-4 top-4 z-10">
          <span className="rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            Example photo · Tap to upload your own
          </span>
        </div>

        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-x-0 bottom-0 h-[160px]"
          style={{ background: "linear-gradient(to top, #0B0B0E, transparent)" }}
        />
      </div>

      {/* Bottom Content — design: padding [0,20,24,20], gap 12 */}
      <div className="flex shrink-0 flex-col gap-3 px-5 pb-6">
        {/* Motion Prompt label — design: gap 6 */}
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          <span className="text-[13px] font-semibold text-[var(--primary)]">Motion Prompt</span>
        </div>

        {/* Prompt card — design: padding 16, fontSize 15, lineHeight 1.4 */}
        <div className="rounded-2xl bg-[#16161A] p-4">
          <p className="text-[15px] leading-[1.4] text-[var(--foreground)]">
            {currentExample.prompt}
          </p>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleExampleClick}
          className="flex h-[52px] w-full items-center justify-center rounded-[14px] text-base font-bold text-[#0B0B0E] transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            boxShadow: "0 4px 20px rgba(232,168,56,0.25)",
          }}
        >
          Make It Move · Free
        </button>

        {/* Secondary CTA */}
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex h-12 w-full items-center justify-center rounded-[14px] text-[15px] font-medium text-[var(--foreground)] transition-all active:scale-[0.98]"
          style={{ border: "1.5px solid #2A2A2E" }}
        >
          Or upload your own photo
        </button>
      </div>
    </div>
  );
}
