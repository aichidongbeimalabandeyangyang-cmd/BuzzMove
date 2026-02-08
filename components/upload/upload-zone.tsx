"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

interface RecentUpload {
  id: string;
  url: string;
  name: string;
  uploadedAt: number;
}

const RECENT_UPLOADS_KEY = "buzzmove_recent_uploads";
const MAX_RECENT = 8;

function getRecentUploads(): RecentUpload[] {
  try {
    const stored = localStorage.getItem(RECENT_UPLOADS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentUpload(url: string, name: string) {
  try {
    const uploads = getRecentUploads();
    const newUpload: RecentUpload = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      name,
      uploadedAt: Date.now(),
    };
    const updated = [newUpload, ...uploads.filter(u => u.url !== url)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_UPLOADS_KEY, JSON.stringify(updated));
  } catch {}
}

export { saveRecentUpload };

export function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentUploads(getRecentUploads());
  }, []);

  const validateFile = (file: File): boolean => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be under 10MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleRecentClick = (upload: RecentUpload) => {
    // For recent uploads, we create a synthetic file from the URL
    // but since we already have the URL, we signal this differently
    // We'll fetch the image and create a file from it
    setError(null);
    fetch(upload.url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], upload.name, { type: blob.type || "image/jpeg" });
        onFileSelected(file);
      })
      .catch(() => setError("Failed to load this image. Please try uploading again."));
  };

  return (
    <div className={`${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Header */}
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Choose a photo</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Pick a recent upload or add a new one
        </p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Add New card */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] transition-all hover:border-[var(--primary-40)] hover:bg-[var(--primary-5)] active:scale-[0.97]"
          aria-label="Upload new photo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-10)] transition-transform group-hover:scale-110">
            <svg className="h-5 w-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-xs font-medium text-[var(--muted-foreground)] group-hover:text-[var(--primary)]">
            Add New
          </span>
        </button>

        {/* Recent uploads */}
        {recentUploads.map((upload) => (
          <button
            key={upload.id}
            type="button"
            onClick={() => handleRecentClick(upload)}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-[var(--secondary)] transition-all hover:ring-2 hover:ring-[var(--primary)] active:scale-[0.97]"
          >
            <Image
              src={upload.url}
              alt={upload.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
        ))}

        {/* Empty placeholders if fewer than 8 recent uploads */}
        {recentUploads.length === 0 && Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="aspect-square rounded-2xl bg-[var(--card)] border border-[var(--border)]"
          />
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_FORMATS.join(",")}
        tabIndex={-1}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Formats hint */}
      <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
        JPG, PNG, WebP &middot; Up to 10 MB
      </p>

      {error && (
        <div role="alert" className="mt-3 rounded-xl bg-[var(--destructive-10)] px-4 py-2.5 text-center text-sm text-[var(--destructive)]">
          {error}
        </div>
      )}
    </div>
  );
}
