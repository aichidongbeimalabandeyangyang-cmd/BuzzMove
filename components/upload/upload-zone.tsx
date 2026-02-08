"use client";

import { useRef } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

// Persist recent uploads in localStorage
const STORAGE_KEY = "buzzmove_recent_uploads";

interface RecentUpload {
  url: string;
  name: string;
  timestamp: number;
}

export function saveRecentUpload(url: string, name: string) {
  try {
    const existing: RecentUpload[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = [{ url, name, timestamp: Date.now() }, ...existing.filter((u) => u.url !== url)].slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

function getRecentUploads(): RecentUpload[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const recents = getRecentUploads();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      alert("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File too large. Max 10MB.");
      return;
    }
    onFileSelected(file);
  };

  const handleRecentClick = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], "recent-upload.jpg", { type: blob.type });
      onFileSelected(file);
    } catch {
      alert("Could not load this image. Please upload a new one.");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Title: 22/700 #FAFAF9 */}
      <h1 className="text-[22px] font-bold text-[#FAFAF9]">Choose a photo</h1>

      {/* Subtitle: 13/500 #6B6B70 */}
      <p className="text-[13px] font-medium text-[#6B6B70]">Recent uploads</p>

      {/* Photo Grid: gap 10, 3 columns */}
      <div className="flex flex-col gap-2.5">
        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Add New Card: h150, cornerRadius 14, stroke 1.5px #252530, gap 8 */}
          <button
            onClick={() => inputRef.current?.click()}
            className="flex h-[150px] flex-col items-center justify-center gap-2 rounded-[14px]"
            style={{ border: "1.5px solid #252530" }}
          >
            <Plus className="h-8 w-8 text-[#E8A838]" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#6B6B70]">Add New</span>
          </button>

          {/* Recent photos */}
          {recents.slice(0, 2).map((item, i) => (
            <button
              key={i}
              onClick={() => handleRecentClick(item.url)}
              className="relative h-[150px] overflow-hidden rounded-[14px]"
            >
              <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized />
            </button>
          ))}
          {/* Empty placeholders if needed */}
          {Array.from({ length: Math.max(0, 2 - recents.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="h-[150px] rounded-[14px] bg-[#16161A]" />
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-2.5">
          {recents.slice(2, 5).map((item, i) => (
            <button
              key={i}
              onClick={() => handleRecentClick(item.url)}
              className="relative h-[150px] overflow-hidden rounded-[14px]"
            >
              <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized />
            </button>
          ))}
          {Array.from({ length: Math.max(0, 3 - recents.slice(2, 5).length) }).map((_, i) => (
            <div key={`empty2-${i}`} className="h-[150px] rounded-[14px] bg-[#16161A]" />
          ))}
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-2.5">
          {recents.slice(5, 8).map((item, i) => (
            <button
              key={i}
              onClick={() => handleRecentClick(item.url)}
              className="relative h-[150px] overflow-hidden rounded-[14px]"
            >
              <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized />
            </button>
          ))}
          {Array.from({ length: Math.max(0, 3 - recents.slice(5, 8).length) }).map((_, i) => (
            <div key={`empty3-${i}`} className="h-[150px] rounded-[14px] bg-[#16161A]" />
          ))}
        </div>
      </div>
    </div>
  );
}
