"use client";

import { useState, useCallback, useRef } from "react";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer active:scale-[0.98] ${
        isDragging
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_FORMATS.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)]">
        <svg
          className="h-8 w-8 text-[var(--primary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>

      <p className="mb-1 text-lg font-semibold">Tap to Upload</p>
      <p className="text-sm text-[var(--muted-foreground)]">
        JPG, PNG, WebP
      </p>

      {error && (
        <p className="mt-3 text-sm text-[var(--destructive)]">{error}</p>
      )}

      <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Private & Secure
      </div>
    </div>
  );
}
