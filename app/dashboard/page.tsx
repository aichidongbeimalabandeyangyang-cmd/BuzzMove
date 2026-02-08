"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Download, Share2, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { removeRecentUpload } from "@/components/upload/upload-zone";

// ---- VIDEO DETAIL (uses getStatus to poll & resolve video URL) ----
function VideoDetail({ videoId, onBack }: { videoId: string; onBack: () => void }) {
  const utils = trpc.useUtils();
  const { data: video, isLoading } = trpc.video.getStatus.useQuery(
    { videoId },
    {
      refetchInterval: (query) => {
        const st = query.state.data?.status;
        if (st === "completed" || st === "failed") return false;
        return 5000;
      },
    }
  );

  const deleteMutation = trpc.video.delete.useMutation({
    onSuccess() {
      utils.video.list.invalidate();
      onBack();
    },
  });

  const videoUrl = video?.output_video_url;

  const handleShare = async () => {
    if (!videoUrl) return;
    if (navigator.share) {
      try { await navigator.share({ title: "Check out my AI video!", url: videoUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(videoUrl);
    }
  };

  const handleDelete = () => {
    if (confirm("Delete this video?")) {
      deleteMutation.mutate({ videoId });
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <button onClick={onBack} className="flex items-center" style={{ gap: 8, padding: "0 20px", height: 44 }}>
        <ArrowLeft style={{ width: 22, height: 22, color: "#FAFAF9" }} strokeWidth={1.5} />
        <span style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF9" }}>Result</span>
      </button>

      <div className="flex flex-1 flex-col" style={{ gap: 20, padding: "8px 20px 20px 20px" }}>
        {videoUrl ? (
          <div className="relative w-full overflow-hidden" style={{ height: 440, borderRadius: 20, flexShrink: 0 }}>
            <video src={videoUrl} controls autoPlay loop playsInline className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center" style={{ height: 440, borderRadius: 20, backgroundColor: "#16161A", gap: 12 }}>
            {isLoading || video?.status === "generating" ? (
              <>
                <div className="relative" style={{ width: 48, height: 48 }}>
                  <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
                  <div className="absolute inset-0 animate-spin-slow rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
                </div>
                <p style={{ fontSize: 14, color: "#6B6B70" }}>
                  {video?.status === "generating" ? "Video is still processing..." : "Loading..."}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 14, color: "#6B6B70" }}>
                {video?.status === "failed" ? "Generation failed" : "Video not available"}
              </p>
            )}
          </div>
        )}

        {videoUrl && (
          <div className="flex" style={{ gap: 10 }}>
            <a
              href={videoUrl}
              download
              className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
              style={{ height: 48, borderRadius: 14, gap: 8, background: "linear-gradient(135deg, #F0C060, #E8A838)", boxShadow: "0 4px 20px #E8A83840" }}
            >
              <Download style={{ width: 20, height: 20, color: "#0B0B0E" }} strokeWidth={1.5} />
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0B0B0E" }}>Download</span>
            </a>
            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
              style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", gap: 8 }}
            >
              <Share2 style={{ width: 20, height: 20, color: "#FAFAF9" }} strokeWidth={1.5} />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Share</span>
            </button>
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
          style={{ height: 48, borderRadius: 14, border: "1.5px solid #EF444440", gap: 8 }}
        >
          <Trash2 style={{ width: 18, height: 18, color: "#EF4444" }} strokeWidth={1.5} />
          <span style={{ fontSize: 15, fontWeight: 500, color: "#EF4444" }}>
            {deleteMutation.isPending ? "Deleting..." : "Delete Video"}
          </span>
        </button>
      </div>
    </div>
  );
}

// ---- PHOTOS GRID (from localStorage recent uploads) ----
function PhotosGrid() {
  const [, forceUpdate] = useState(0);

  let photos: { url: string; name: string; timestamp: number }[] = [];
  try {
    photos = JSON.parse(localStorage.getItem("buzzmove_recent_uploads") || "[]");
  } catch {}

  const handleDelete = (url: string) => {
    removeRecentUpload(url);
    forceUpdate((n) => n + 1);
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 12 }}>
        <p style={{ fontSize: 14, color: "#6B6B70" }}>No photos yet</p>
        <p style={{ fontSize: 12, color: "#4A4A50" }}>Your uploaded photos will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      {Array.from({ length: Math.ceil(photos.length / 3) }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-3" style={{ gap: 12 }}>
          {photos.slice(rowIdx * 3, rowIdx * 3 + 3).map((photo) => (
            <div key={photo.url} className="relative overflow-hidden" style={{ height: 150, borderRadius: 14 }}>
              <Image src={photo.url} alt={photo.name} fill className="object-cover" unoptimized />
              <button
                onClick={() => handleDelete(photo.url)}
                className="absolute flex items-center justify-center"
                style={{ top: 6, right: 6, width: 24, height: 24, borderRadius: 100, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 10 }}
              >
                <X style={{ width: 12, height: 12, color: "#FFFFFF" }} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AssetsPage() {
  const [tab, setTab] = useState<"videos" | "photos">("videos");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { data } = trpc.video.list.useQuery({ limit: 20, offset: 0 });
  const videos = data?.videos;

  // ---- VIDEO DETAIL VIEW ----
  if (selectedVideoId) {
    return (
      <VideoDetail
        videoId={selectedVideoId}
        onBack={() => setSelectedVideoId(null)}
      />
    );
  }

  // ---- ASSETS GRID ----
  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Tab Switcher: padding [0,16,8,16], horizontal, gap 4 */}
      <div className="flex" style={{ gap: 4, padding: "0 16px 8px 16px" }}>
        {(["videos", "photos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center justify-center"
            style={{
              height: 36,
              borderRadius: 10,
              padding: "0 20px",
              fontSize: 14,
              fontWeight: tab === t ? 600 : 500,
              color: tab === t ? "#0B0B0E" : "#6B6B70",
              backgroundColor: tab === t ? "#E8A838" : "transparent",
            }}
          >
            {t === "videos" ? "Videos" : "Photos"}
          </button>
        ))}
      </div>

      {/* Video Grid: vertical, gap 12, padding [8,16], h-fill, scrollable */}
      <div className="flex flex-1 flex-col overflow-y-auto" style={{ gap: 12, padding: "8px 16px 16px 16px" }}>
        {tab === "videos" ? (
          videos && videos.length > 0 ? (
            <div className="flex flex-col" style={{ gap: 12 }}>
              {Array.from({ length: Math.ceil(videos.length / 2) }).map((_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-2" style={{ gap: 12 }}>
                  {videos.slice(rowIdx * 2, rowIdx * 2 + 2).map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideoId(video.id)}
                      className="relative overflow-hidden text-left"
                      style={{ height: 210, borderRadius: 16, backgroundColor: "#16161A" }}
                    >
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
                      {/* Duration Badge */}
                      <div
                        className="absolute"
                        style={{ bottom: 8, left: 8, borderRadius: 8, backgroundColor: "#00000080", padding: "3px 8px" }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#FFFFFF" }}>
                          0:{String(video.duration || 5).padStart(2, "0")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 12 }}>
              <p style={{ fontSize: 14, color: "#6B6B70" }}>No videos yet</p>
              <p style={{ fontSize: 12, color: "#4A4A50" }}>Your generated videos will appear here</p>
            </div>
          )
        ) : (
          <PhotosGrid />
        )}
      </div>
    </div>
  );
}
