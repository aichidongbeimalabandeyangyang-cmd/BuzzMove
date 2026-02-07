"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload/upload-zone";
import { VideoGenerator } from "@/components/video/video-generator";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
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
      const supabase = createSupabaseBrowserClient();
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(`images/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(data.path);

      setImageUrl(publicUrl);
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
      <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-5 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
        </div>
        <div className="animate-scale-in">
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
      <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-5 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
        </div>
        <div className="relative w-full max-w-lg">
          <div className="mb-8 text-center animate-fade-up">
            <h1 className="mb-3 text-3xl font-bold tracking-tight">
              Upload your photo
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              We&apos;ll transform it into a cinematic AI video
            </p>
          </div>

          <div className="animate-fade-up delay-100">
            {uploading ? (
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16">
                <div className="relative h-12 w-12">
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
            onClick={() => setShowUpload(false)}
            className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to examples
          </button>
        </div>
      </div>
    );
  }

  // Default: Hero example view
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center px-5 py-8 sm:py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.02] blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md mx-auto flex flex-col flex-1">
        {/* Example image - hero */}
        <div className="relative flex-1 min-h-0 mb-5 animate-fade-up">
          <div
            className="relative h-full min-h-[400px] max-h-[560px] overflow-hidden rounded-2xl border border-[var(--border)]"
            style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.4)" }}
          >
            <img
              src={currentExample.image}
              alt={currentExample.label}
              className="h-full w-full object-cover"
            />

            {/* Bottom gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Example selector dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {HERO_EXAMPLES.map((ex, i) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveExample(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === activeExample
                      ? "h-2.5 w-8 bg-[var(--primary)]"
                      : "h-2.5 w-2.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* Example label badge */}
            <div className="absolute top-4 left-4">
              <span className="rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/80">
                {currentExample.label}
              </span>
            </div>
          </div>
        </div>

        {/* Motion Prompt section */}
        <div className="mb-5 animate-fade-up delay-100">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span className="text-sm font-medium text-[var(--primary)]">Motion Prompt</span>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
            <p className="text-sm text-[var(--foreground-80)] leading-relaxed">
              {currentExample.prompt}
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3 animate-fade-up delay-200">
          <button
            onClick={handleExampleClick}
            className="w-full rounded-xl py-4 text-base font-semibold text-[var(--background)] transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)", boxShadow: "0 2px 16px rgba(232,168,56,0.25)" }}
          >
            Make It Move (Free)
          </button>

          <button
            onClick={() => setShowUpload(true)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] py-3.5 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--primary-40)] hover:bg-[var(--primary-10)] hover:text-[var(--primary)] active:scale-[0.98]"
          >
            Or upload your own photo
          </button>
        </div>

        {/* Trust signals */}
        <div className="mt-6 flex items-center justify-center gap-5 animate-fade-up delay-300">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <svg className="h-3.5 w-3.5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            30-60s generation
          </div>
          <div className="h-3 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <svg className="h-3.5 w-3.5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            Private &amp; secure
          </div>
          <div className="h-3 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <svg className="h-3.5 w-3.5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
            </svg>
            Free to start
          </div>
        </div>
      </div>
    </div>
  );
}
