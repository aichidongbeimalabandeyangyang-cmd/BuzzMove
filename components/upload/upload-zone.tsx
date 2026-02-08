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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload image"
      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-12 transition-all duration-300 cursor-pointer active:scale-[0.99] ${
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
      onKeyDown={handleKeyDown}
    >
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_FORMATS.join(",")}
        capture="environment"
        tabIndex={-1}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Upload icon */}
      <div className="relative mb-4">
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
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
            />
          </svg>
        </div>
      </div>

      <p className="mb-0.5 text-base font-semibold">
        <span className="sm:hidden">Choose a photo</span>
        <span className="hidden sm:inline">Drop your image here</span>
      </p>
      <p className="text-sm text-[var(--muted-foreground)]">
        <span className="sm:hidden">or take a new one</span>
        <span className="hidden sm:inline">or <span className="text-[var(--primary)] font-medium">browse files</span></span>
      </p>
      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
        JPG, PNG, WebP &middot; Up to 10 MB
      </p>

      {error && (
        <div role="alert" className="mt-3 rounded-xl bg-[var(--destructive-10)] px-3 py-2 text-sm text-[var(--destructive)]">
          {error}
        </div>
      )}
    </div>
  );
}
