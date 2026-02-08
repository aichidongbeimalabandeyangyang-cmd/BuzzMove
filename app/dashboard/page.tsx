"use client";

import { useState } from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";

export default function AssetsPage() {
  const [tab, setTab] = useState<"videos" | "photos">("videos");
  const { data } = trpc.video.list.useQuery({ limit: 20, offset: 0 });
  const videos = data?.videos;

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Tab Switcher: padding [0,16,8,16], horizontal */}
      <div className="flex gap-1 px-4 pb-2">
        {/* Active Tab: h36, cornerRadius 10, fill #E8A838, padding [0,20] */}
        <button
          onClick={() => setTab("videos")}
          className={`flex h-9 items-center justify-center rounded-[10px] px-5 text-sm transition-all ${
            tab === "videos"
              ? "bg-[#E8A838] font-semibold text-[#0B0B0E]"
              : "font-medium text-[#6B6B70]"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setTab("photos")}
          className={`flex h-9 items-center justify-center rounded-[10px] px-5 text-sm transition-all ${
            tab === "photos"
              ? "bg-[#E8A838] font-semibold text-[#0B0B0E]"
              : "font-medium text-[#6B6B70]"
          }`}
        >
          Photos
        </button>
      </div>

      {/* Video Grid: vertical, gap 12, padding [8,16], h-fill, scrollable */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-2 pb-4">
        {tab === "videos" ? (
          videos && videos.length > 0 ? (
            <div className="flex flex-col gap-3">
              {/* Render in rows of 2 */}
              {Array.from({ length: Math.ceil(videos.length / 2) }).map((_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-2 gap-3">
                  {videos.slice(rowIdx * 2, rowIdx * 2 + 2).map((video) => (
                    <div key={video.id} className="relative h-[210px] overflow-hidden rounded-2xl bg-[#16161A]">
                      {video.output_video_url ? (
                        <video
                          src={video.output_video_url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : video.input_image_url ? (
                        <Image src={video.input_image_url} alt="" fill className="object-cover" unoptimized />
                      ) : null}
                      {/* Duration Badge: x8 y182, cornerRadius 8, fill #00000080, padding [3,8] */}
                      <div className="absolute bottom-[28px] left-2 rounded-lg bg-black/50 px-2 py-0.5">
                        <span className="text-[11px] font-semibold text-white">
                          0:{String(video.duration || 5).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <p className="text-sm text-[#6B6B70]">No videos yet</p>
              <p className="text-xs text-[#4A4A50]">Your generated videos will appear here</p>
            </div>
          )
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-sm text-[#6B6B70]">No photos yet</p>
            <p className="text-xs text-[#4A4A50]">Your uploaded photos will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
