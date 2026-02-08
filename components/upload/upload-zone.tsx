"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onExistingSelected?: (url: string) => void;
}

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

export function removeRecentUpload(url: string) {
  try {
    const existing: RecentUpload[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter((u) => u.url !== url)));
  } catch {}
}

export function UploadZone({ onFileSelected, onExistingSelected }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const recents = getRecentUploads();
  const [, forceUpdate] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!SUPPORTED_FORMATS.includes(file.type)) { alert("Please upload a JPEG, PNG, or WebP image."); return; }
    if (file.size > MAX_FILE_SIZE) { alert("File too large. Max 10MB."); return; }
    onFileSelected(file);
  };

  const handleRecentClick = (url: string) => {
    // Reuse existing URL directly — no re-upload
    if (onExistingSelected) {
      onExistingSelected(url);
    }
  };

  const handleDeletePhoto = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    removeRecentUpload(url);
    forceUpdate((n) => n + 1);
  };

  // Build 3 rows x 3 cols of photos
  const allSlots: (RecentUpload | null)[] = [];
  for (let i = 0; i < 8; i++) allSlots.push(recents[i] ?? null);

  return (
    <div className="flex flex-1 flex-col" style={{ gap: 16 }}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />

      {/* Title: 22/700 #FAFAF9 */}
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Choose a photo</h1>

      {/* Subtitle: 13/500 #6B6B70 */}
      <p style={{ fontSize: 13, fontWeight: 500, color: "#6B6B70" }}>Recent uploads</p>

      {/* Photo Grid: gap 10, 3 columns */}
      <div className="flex flex-col" style={{ gap: 10 }}>
        {/* Row 1: Add New + 2 recent */}
        <div className="grid grid-cols-3" style={{ gap: 10 }}>
          <button
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center"
            style={{ height: 150, borderRadius: 14, border: "1.5px solid #252530", gap: 8 }}
          >
            <Plus style={{ width: 32, height: 32, color: "#E8A838" }} strokeWidth={1.5} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Add New</span>
          </button>
          {[0, 1].map((i) => <PhotoCell key={i} item={allSlots[i]} onClick={handleRecentClick} onDelete={handleDeletePhoto} />)}
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-3" style={{ gap: 10 }}>
          {[2, 3, 4].map((i) => <PhotoCell key={i} item={allSlots[i]} onClick={handleRecentClick} onDelete={handleDeletePhoto} />)}
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-3" style={{ gap: 10 }}>
          {[5, 6, 7].map((i) => <PhotoCell key={i} item={allSlots[i]} onClick={handleRecentClick} onDelete={handleDeletePhoto} />)}
        </div>
      </div>
    </div>
  );
}

// ---- Photo cell with delete button ----
function PhotoCell({
  item,
  onClick,
  onDelete,
}: {
  item: RecentUpload | null;
  onClick: (url: string) => void;
  onDelete: (e: React.MouseEvent, url: string) => void;
}) {
  if (!item) {
    return <div style={{ height: 150, borderRadius: 14, backgroundColor: "#16161A" }} />;
  }
  return (
    <button onClick={() => onClick(item.url)} className="relative overflow-hidden" style={{ height: 150, borderRadius: 14 }}>
      <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized />
      {/* Delete button */}
      <div
        onClick={(e) => onDelete(e, item.url)}
        className="absolute flex items-center justify-center"
        style={{ top: 6, right: 6, width: 24, height: 24, borderRadius: 100, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 10 }}
      >
        <X style={{ width: 12, height: 12, color: "#FFFFFF" }} strokeWidth={2} />
      </div>
    </button>
  );
}
