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
      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer active:scale-[0.99] ${
        isDragging
          ? "border-[var(--primary)] bg-[var(--primary-5)]"
          : "border-[var(--border)] hover:border-[var(--primary-40)] hover:bg-[var(--card)]"
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

      {/* Upload icon */}
      <div className="relative mb-5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: "linear-gradient(135deg, rgba(232,168,56,0.12), rgba(240,192,96,0.06))" }}
        >
          <svg
            className="h-6 w-6 text-[var(--primary)] transition-transform duration-300 group-hover:-translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
      </div>

      <p className="mb-1 text-base font-semibold">
        Drop your image here
      </p>
      <p className="text-sm text-[var(--muted-foreground)]">
        or <span className="text-[var(--primary)] font-medium">browse files</span>
      </p>
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">
        JPG, PNG, WebP &middot; Up to 10 MB
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-[var(--destructive-10)] px-3 py-2 text-sm text-[var(--destructive)]">
          {error}
        </div>
      )}
    </div>
  );
}
