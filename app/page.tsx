"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload/upload-zone";
import { VideoGenerator } from "@/components/video/video-generator";
import { createSupabaseBrowserClient } from "@/server/supabase/client";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
  };

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-5 py-16">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.02] blur-[100px]" />
      </div>

      {imageUrl && imagePreview ? (
        <div className="animate-scale-in">
          <VideoGenerator
            imageUrl={imageUrl}
            imagePreview={imagePreview}
            onReset={handleReset}
          />
        </div>
      ) : (
        <div className="relative w-full max-w-lg">
          {/* Hero content */}
          <div className="mb-10 text-center animate-fade-up">
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Photo to <span className="text-gradient">Video</span>
            </h1>
            <p className="mx-auto max-w-sm text-base text-[var(--muted-foreground)] leading-relaxed">
              Transform any image into a cinematic AI video. Just upload and watch it come alive.
            </p>
          </div>

          {/* Upload zone or loading */}
          <div className="animate-fade-up delay-200">
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

          {/* Trust signals */}
          <div className="mt-8 flex items-center justify-center gap-5 animate-fade-up delay-400">
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
      )}
    </div>
  );
}
