"use client";

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import Image from "next/image";
import { GeneratingPoller } from "@/components/video/generating-poller";

type Tab = "videos" | "photos";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const { data: videosData, isLoading } = trpc.video.list.useQuery(
    { limit: 20, offset: 0 },
    {
      refetchInterval: (query) => {
        const hasGenerating = query.state.data?.videos.some(
          (v) => v.status === "generating" || v.status === "pending"
        );
        return hasGenerating ? 5000 : false;
      },
    }
  );

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col">
      {/* Tab switcher — matches design exactly */}
      <div className="flex gap-1 px-4 pb-2">
        <button
          onClick={() => setActiveTab("videos")}
          className={`flex h-9 items-center justify-center rounded-[10px] px-5 text-sm font-semibold transition-all ${
            activeTab === "videos"
              ? "bg-[var(--primary)] text-[#0B0B0E]"
              : "text-[#6B6B70]"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex h-9 items-center justify-center rounded-[10px] px-5 text-sm font-medium transition-all ${
            activeTab === "photos"
              ? "bg-[var(--primary)] text-[#0B0B0E]"
              : "text-[#6B6B70]"
          }`}
        >
          Photos
        </button>
      </div>

      {/* Content */}
      {activeTab === "videos" && (
        <div className="flex-1 px-4 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
                <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[var(--primary)]" />
              </div>
            </div>
          ) : videosData?.videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)]">
                <svg className="h-6 w-6 text-[#6B6B70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <p className="mb-2 text-lg font-semibold">No videos yet</p>
              <p className="mb-6 text-sm text-[#6B6B70]">Upload an image to create your first AI video</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-[14px] px-6 py-3.5 text-sm font-semibold text-[#0B0B0E] transition-all active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #F0C060, #E8A838)" }}
              >
                Create Your First Video
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* 2-column grid, 210px height, gap 12, rounded-2xl */}
              {chunk(videosData?.videos ?? [], 2).map((row, i) => (
                <div key={i} className="flex gap-3">
                  {row.map((video) => (
                    <DashboardVideoCard key={video.id} video={video} />
                  ))}
                  {row.length < 2 && <div className="flex-1" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "photos" && (
        <div className="flex-1 px-4 pt-2">
          <PhotosTab />
        </div>
      )}
    </div>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function PhotosTab() {
  const [photos, setPhotos] = useState<Array<{id: string; url: string; name: string}>>([]);

  useState(() => {
    try {
      const stored = localStorage.getItem("buzzmove_recent_uploads");
      if (stored) setPhotos(JSON.parse(stored));
    } catch {}
  });

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)]">
          <svg className="h-6 w-6 text-[#6B6B70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        </div>
        <p className="mb-2 text-lg font-semibold">No photos uploaded</p>
        <p className="mb-6 text-sm text-[#6B6B70]">Photos you upload will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {chunk(photos, 3).map((row, i) => (
        <div key={i} className="flex gap-3">
          {row.map((photo) => (
            <div key={photo.id} className="relative h-[150px] flex-1 overflow-hidden rounded-2xl bg-[var(--secondary)]">
              <Image src={photo.url} alt={photo.name} fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function DashboardVideoCard({ video }: { video: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleTogglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.paused ? vid.play() : (vid.pause(), vid.currentTime = 0);
  }, []);

  if (video.status === "generating" || video.status === "pending") {
    return (
      <div className="flex-1 overflow-hidden rounded-2xl bg-[var(--card)]">
        <GeneratingPoller videoId={video.id} />
        <div className="p-3">
          <p className="line-clamp-1 text-xs text-[var(--foreground-80)]">{video.prompt || "No prompt"}</p>
        </div>
      </div>
    );
  }

  if (video.status === "completed" && video.output_video_url) {
    return (
      <div className="group flex-1 overflow-hidden rounded-2xl bg-[var(--card)]" style={{ height: 210 }}>
        <div className="relative h-full cursor-pointer" onClick={handleTogglePlay}>
          <video ref={videoRef} src={video.output_video_url} className="h-full w-full object-cover" muted loop playsInline preload="none" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <svg className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
          {/* Duration label */}
          <div className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-0.5">
            <span className="text-[11px] font-medium text-white">{video.duration ? `0:${String(video.duration).padStart(2, "0")}` : ""}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-[var(--secondary)]" style={{ height: 210 }}>
      <span className={`rounded-full px-3 py-1.5 text-xs ${video.status === "failed" ? "bg-[var(--destructive-10)] text-[var(--destructive)]" : "text-[#6B6B70]"}`}>
        {video.status === "failed" ? "Failed" : video.status}
      </span>
    </div>
  );
}
