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
  } catch { return []; }
}

function saveRecentUpload(url: string, name: string) {
  try {
    const uploads = getRecentUploads();
    const newUpload: RecentUpload = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, url, name, uploadedAt: Date.now() };
    const updated = [newUpload, ...uploads.filter(u => u.url !== url)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_UPLOADS_KEY, JSON.stringify(updated));
  } catch {}
}

export { saveRecentUpload };

export function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setRecentUploads(getRecentUploads()); }, []);

  const validateFile = (file: File): boolean => {
    if (!SUPPORTED_FORMATS.includes(file.type)) { setError("Please upload a JPG, PNG, or WebP image"); return false; }
    if (file.size > MAX_FILE_SIZE) { setError("File size must be under 10MB"); return false; }
    setError(null);
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) onFileSelected(file);
  }, [onFileSelected]);

  const handleRecentClick = (upload: RecentUpload) => {
    setError(null);
    fetch(upload.url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], upload.name, { type: blob.type || "image/jpeg" });
        onFileSelected(file);
      })
      .catch(() => setError("Failed to load this image. Try uploading again."));
  };

  return (
    <div className={`flex flex-1 flex-col gap-4 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Title */}
      <div>
        <h2 className="text-[22px] font-bold text-[var(--foreground)]">Choose a photo</h2>
        <p className="mt-1 text-[13px] font-medium text-[#6B6B70]">Recent uploads</p>
      </div>

      {/* Photo grid — 3 columns, responsive using CSS grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Add New button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[1/1.25] flex-col items-center justify-center gap-2 rounded-[14px] transition-all active:scale-[0.97]"
          style={{ border: "1.5px solid #252530" }}
          aria-label="Upload new photo"
        >
          <svg className="h-8 w-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-xs font-medium text-[#6B6B70]">Add New</span>
        </button>

        {/* Recent photos */}
        {recentUploads.slice(0, 8).map((upload) => (
          <button
            key={upload.id}
            type="button"
            onClick={() => handleRecentClick(upload)}
            className="relative aspect-[1/1.25] overflow-hidden rounded-[14px] bg-[var(--secondary)] transition-all active:scale-[0.97]"
          >
            <Image src={upload.url} alt={upload.name} fill className="object-cover" unoptimized />
          </button>
        ))}

        {/* Empty placeholder cells to fill the grid */}
        {Array.from({ length: Math.max(0, 8 - recentUploads.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-[1/1.25] rounded-[14px] bg-[#16161A]" />
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_FORMATS.join(",")}
        tabIndex={-1}
        className="sr-only"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }}
      />

      {error && (
        <div role="alert" className="rounded-xl bg-[var(--destructive-10)] px-4 py-2.5 text-center text-sm text-[var(--destructive)]">
          {error}
        </div>
      )}
    </div>
  );
}
