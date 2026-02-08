"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadZone } from "@/components/upload/upload-zone";
import { VideoGenerator } from "@/components/video/video-generator";
import { HERO_EXAMPLES } from "@/lib/constants";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [activeExample, setActiveExample] = useState(0);

  const handleFileSelected = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setSelectedFile(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setImageUrl(data.url);
    } catch (err) {
      console.error("Upload failed:", err);
      setSelectedFile(null);
      setImagePreview(null);
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
    setShowUpload(false);
  };

  const handleExampleClick = () => {
    const example = HERO_EXAMPLES[activeExample];
    const fullUrl = `${window.location.origin}${example.image}`;
    setImageUrl(fullUrl);
    setImagePreview(example.image);
    setInitialPrompt(example.prompt);
  };

  const currentExample = HERO_EXAMPLES[activeExample];

  // Show VideoGenerator when image is ready
  if (imageUrl && imagePreview) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
        </div>
        <div className="animate-scale-in w-full max-w-lg">
          <VideoGenerator
            imageUrl={imageUrl}
            imagePreview={imagePreview}
            onReset={handleReset}
            initialPrompt={initialPrompt}
          />
        </div>
      </div>
    );
  }

  // Show upload zone
  if (showUpload) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
        </div>
        <div className="relative w-full max-w-lg">
          <div className="mb-6 text-center animate-fade-up">
            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Upload your photo
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              We&apos;ll transform it into a cinematic AI video
            </p>
          </div>

          <div className="animate-fade-up delay-100">
            {uploading ? (
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16">
                <div className="relative h-12 w-12" role="status" aria-label="Uploading image">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
                  <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[var(--primary)]" />
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Uploading your image...
                </p>
              </div>
            ) : (
              <UploadZone onFileSelected={handleFileSelected} />
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowUpload(false)}
            className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to examples
          </button>
        </div>
      </div>
    );
  }

  // Default: Hero example view — compact, everything above the fold
  return (
    <div className="relative mx-auto flex flex-1 max-w-md flex-col px-4 py-4 sm:py-6">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
      </div>

      {/* Example image — constrained aspect ratio */}
      <div className="relative mb-4 animate-fade-up">
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl"
        >
          <Image
            src={currentExample.image}
            alt={currentExample.label}
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
            priority
          />

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2" role="tablist" aria-label="Example images">
            {HERO_EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                type="button"
                role="tab"
                aria-selected={i === activeExample}
                aria-label={`Example: ${ex.label}`}
                onClick={() => setActiveExample(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === activeExample
                    ? "h-2 w-7 bg-[var(--primary)]"
                    : "h-2 w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Label */}
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-medium text-white">
              {currentExample.label}
            </span>
          </div>
        </div>
      </div>

      {/* Motion Prompt — compact */}
      <div className="mb-4 animate-fade-up delay-100">
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="h-3.5 w-3.5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          <span className="text-xs font-medium text-[var(--primary)]">Motion Prompt</span>
        </div>
        <div className="rounded-xl bg-[var(--card)] px-3.5 py-2.5">
          <p className="text-xs text-[var(--foreground-80)] leading-relaxed">
            {currentExample.prompt}
          </p>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="space-y-2.5 animate-fade-up delay-200">
        <button
          type="button"
          onClick={handleExampleClick}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-[var(--background)] transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)", boxShadow: "0 2px 16px rgba(232,168,56,0.25)" }}
        >
          Make It Move (Free)
        </button>

        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--primary-40)] hover:bg-[var(--primary-10)] hover:text-[var(--primary)] active:scale-[0.98]"
        >
          Or upload your own photo
        </button>
      </div>

      {/* Trust signals — hidden on very small screens to save space */}
      <div className="mt-auto pt-4 flex items-center justify-center gap-4 animate-fade-up delay-300">
        <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
          <svg className="h-3 w-3 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          30-60s
        </div>
        <div className="h-2.5 w-px bg-[var(--border)]" aria-hidden="true" />
        <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
          <svg className="h-3 w-3 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Private
        </div>
        <div className="h-2.5 w-px bg-[var(--border)]" aria-hidden="true" />
        <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
          <svg className="h-3 w-3 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
          </svg>
          Free to start
        </div>
      </div>
    </div>
  );
}
