"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/gtag";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Share2, Trash2, X, Lock, CheckCircle, XCircle, Loader2, Copy, Check, RefreshCw, Pin, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PaywallModal } from "@/components/paywall-modal";

// ---- VIDEO DETAIL (uses getStatus to poll & resolve video URL) ----
function VideoDetail({ videoId, onBack }: { videoId: string; onBack: () => void }) {
  const router = useRouter();
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
  const { data: creditData } = trpc.credit.getBalance.useQuery();
  const [showPaywall, setShowPaywall] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPaid = creditData?.hasPurchased ?? false;

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

  const handleDownload = () => {
    if (!videoUrl) return;
    if (!isPaid) {
      setShowPaywall(true);
      return;
    }
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "";
    a.click();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteMutation.mutate({ videoId });
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <button onClick={onBack} className="flex items-center lg:hidden" style={{ gap: 8, padding: "0 20px", height: 44 }}>
        <ArrowLeft style={{ width: 22, height: 22, color: "#FAFAF9" }} strokeWidth={1.5} />
        <span style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF9" }}>Result</span>
      </button>
      {/* Desktop back link */}
      <button onClick={onBack} className="hidden lg:flex items-center" style={{ gap: 8, padding: "0 20px", height: 44 }}>
        <ArrowLeft style={{ width: 18, height: 18, color: "#6B6B70" }} strokeWidth={1.5} />
        <span style={{ fontSize: 14, fontWeight: 500, color: "#6B6B70" }}>Back to Assets</span>
      </button>

      <div className="flex flex-1 flex-col desktop-container" style={{ gap: 20, padding: "8px 20px 20px 20px" }}>
        <div className="flex flex-col lg:flex-row lg:items-start" style={{ gap: 20 }}>
          {/* Video preview */}
          {videoUrl ? (
            <div className="relative w-full overflow-hidden lg:flex-1 lg:max-w-2xl" style={{ borderRadius: 20, flexShrink: 0 }}>
              <video src={videoUrl} controls autoPlay loop playsInline className="w-full h-auto max-h-[65vh] object-contain" style={{ borderRadius: 20 }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center lg:flex-1 lg:max-w-2xl" style={{ height: 300, borderRadius: 20, backgroundColor: "#16161A", gap: 12 }}>
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

          {/* Right column: actions on desktop */}
          <div className="flex flex-col lg:w-[280px] lg:flex-shrink-0" style={{ gap: 12 }}>
            {/* Prompt display with copy */}
            {video?.prompt && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(video.prompt!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex w-full items-start transition-all active:scale-[0.99]"
                style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "12px 14px", gap: 10, textAlign: "left" }}
              >
                <p className="flex-1" style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: "#9898A4" }}>
                  {video.prompt}
                </p>
                {copied ? (
                  <Check style={{ width: 16, height: 16, color: "#22C55E", flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
                ) : (
                  <Copy style={{ width: 16, height: 16, color: "#6B6B70", flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
                )}
              </button>
            )}

            {videoUrl && (
              <div className="flex" style={{ gap: 10 }}>
                <button
                  onClick={handleDownload}
                  className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
                  style={{ height: 48, borderRadius: 14, gap: 8, background: "linear-gradient(135deg, #F0C060, #E8A838)", boxShadow: "0 4px 20px #E8A83840" }}
                >
                  {isPaid ? (
                    <Download style={{ width: 20, height: 20, color: "#0B0B0E" }} strokeWidth={1.5} />
                  ) : (
                    <Lock style={{ width: 18, height: 18, color: "#0B0B0E" }} strokeWidth={1.5} />
                  )}
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0B0B0E" }}>Download</span>
                </button>
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

            {/* Refine button — go back to generator with same image + prompt */}
            {video?.input_image_url && (
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("image", video.input_image_url);
                  if (video.prompt) params.set("prompt", video.prompt);
                  router.push(`/?${params.toString()}`);
                }}
                className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
                style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", gap: 8 }}
              >
                <RefreshCw style={{ width: 18, height: 18, color: "#E8A838" }} strokeWidth={1.5} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Refine</span>
              </button>
            )}

            {/* Delete button — two-tap confirm */}
            <div className="flex" style={{ gap: 10 }}>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
                style={{
                  height: 48,
                  borderRadius: 14,
                  border: confirmDelete ? "1.5px solid #EF4444" : "1.5px solid #EF444440",
                  backgroundColor: confirmDelete ? "#EF444420" : "transparent",
                  gap: 8,
                }}
              >
                <Trash2 style={{ width: 18, height: 18, color: "#EF4444" }} strokeWidth={1.5} />
                <span style={{ fontSize: 15, fontWeight: 500, color: "#EF4444" }}>
                  {deleteMutation.isPending ? "Deleting..." : confirmDelete ? "Tap again to confirm" : "Delete Video"}
                </span>
              </button>
              {confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex items-center justify-center transition-all active:scale-[0.98]"
                  style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", padding: "0 16px" }}
                >
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#6B6B70" }}>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}

// ---- PHOTO DETAIL ----
function PhotoDetail({ photoId, photoUrl, isPinned, onBack }: { photoId: string; photoUrl: string; isPinned: boolean; onBack: () => void }) {
  const utils = trpc.useUtils();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = trpc.image.delete.useMutation({
    onSuccess() {
      utils.image.list.invalidate();
      onBack();
    },
  });

  const pinMutation = trpc.image.togglePin.useMutation({
    onSuccess() {
      utils.image.list.invalidate();
    },
  });

  const pinned = pinMutation.data ? pinMutation.data.pinned : isPinned;

  return (
    <div className="flex w-full flex-1 flex-col">
      <button onClick={onBack} className="flex items-center" style={{ gap: 8, padding: "0 20px", height: 44 }}>
        <ArrowLeft style={{ width: 22, height: 22, color: "#FAFAF9" }} strokeWidth={1.5} />
        <span style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF9" }}>Photo</span>
      </button>

      <div className="flex flex-1 flex-col desktop-container" style={{ gap: 16, padding: "8px 20px 20px 20px" }}>
        {/* Full image */}
        <div className="relative w-full overflow-hidden lg:max-w-2xl lg:mx-auto" style={{ borderRadius: 20 }}>
          <img src={photoUrl} alt="Photo" className="w-full h-auto max-h-[65vh] object-contain" style={{ borderRadius: 20 }} />
        </div>

        {/* Actions */}
        <div className="flex lg:max-w-2xl lg:mx-auto lg:w-full" style={{ gap: 10 }}>
          {/* Pin / Unpin */}
          <button
            onClick={() => pinMutation.mutate({ id: photoId })}
            disabled={pinMutation.isPending}
            className="flex flex-1 items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              height: 48,
              borderRadius: 14,
              gap: 8,
              border: pinned ? "1.5px solid #E8A838" : "1.5px solid #252530",
              backgroundColor: pinned ? "#E8A83815" : "transparent",
            }}
          >
            <Pin style={{ width: 18, height: 18, color: pinned ? "#E8A838" : "#FAFAF9", transform: pinned ? "none" : "rotate(45deg)" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 600, color: pinned ? "#E8A838" : "#FAFAF9" }}>
              {pinned ? "Pinned" : "Pin"}
            </span>
          </button>

          {/* Use in Generator */}
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set("image", photoUrl);
              window.location.href = `/?${params.toString()}`;
            }}
            className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
            style={{ height: 48, borderRadius: 14, gap: 8, background: "linear-gradient(135deg, #F0C060, #E8A838)", boxShadow: "0 4px 20px #E8A83840" }}
          >
            <Sparkles style={{ width: 18, height: 18, color: "#0B0B0E" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0B0B0E" }}>Generate</span>
          </button>
        </div>

        {/* Delete */}
        <div className="flex lg:max-w-2xl lg:mx-auto lg:w-full" style={{ gap: 10 }}>
          <button
            onClick={() => {
              if (!confirmDelete) { setConfirmDelete(true); return; }
              deleteMutation.mutate({ id: photoId });
            }}
            disabled={deleteMutation.isPending}
            className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
            style={{
              height: 48,
              borderRadius: 14,
              border: confirmDelete ? "1.5px solid #EF4444" : "1.5px solid #EF444440",
              backgroundColor: confirmDelete ? "#EF444420" : "transparent",
              gap: 8,
            }}
          >
            <Trash2 style={{ width: 18, height: 18, color: "#EF4444" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 500, color: "#EF4444" }}>
              {deleteMutation.isPending ? "Deleting..." : confirmDelete ? "Tap again to confirm" : "Delete Photo"}
            </span>
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex items-center justify-center transition-all active:scale-[0.98]"
              style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", padding: "0 16px" }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: "#6B6B70" }}>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- PHOTOS GRID (from image_uploads table) ----
function PhotosGrid({ onSelectPhoto }: { onSelectPhoto: (photo: { id: string; url: string; is_pinned: boolean }) => void }) {
  const { data: photos, isLoading } = trpc.image.list.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 8 }}>
        <div className="relative" style={{ width: 32, height: 32 }}>
          <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
          <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
        </div>
        <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading...</span>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 12 }}>
        <p style={{ fontSize: 14, color: "#6B6B70" }}>No photos yet</p>
        <p style={{ fontSize: 12, color: "#4A4A50" }}>Your uploaded photos will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{ gap: 12 }}>
      {photos.map((photo) => (
        <button
          key={photo.id}
          onClick={() => onSelectPhoto({ id: photo.id, url: photo.url, is_pinned: photo.is_pinned ?? false })}
          className="relative overflow-hidden text-left"
          style={{ aspectRatio: "3/4", borderRadius: 14, backgroundColor: "#16161A" }}
        >
          <Image src={photo.url} alt={photo.filename || "Photo"} fill className="object-cover" unoptimized />
          {photo.is_pinned && (
            <div className="absolute" style={{ top: 6, left: 6 }}>
              <div className="flex items-center justify-center" style={{ width: 22, height: 22, borderRadius: 100, backgroundColor: "rgba(0,0,0,0.6)" }}>
                <Pin style={{ width: 11, height: 11, color: "#E8A838" }} strokeWidth={2} />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function SearchParamsHandler({ onVideoId }: { onVideoId: (id: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      trackPurchase(0);
    }
    const videoId = searchParams.get("video");
    if (videoId) {
      onVideoId(videoId);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);
  return null;
}

export default function AssetsPage() {
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<"videos" | "photos">("videos");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ id: string; url: string; is_pinned: boolean } | null>(null);
  const { data } = trpc.video.list.useQuery(
    { limit: 20, offset: 0 },
    {
      refetchInterval: (query) => {
        const vids = query.state.data?.videos;
        if (!vids) return false;
        const hasGenerating = vids.some(
          (v: any) => v.status === "generating" || v.status === "pending"
        );
        return hasGenerating ? 8000 : false;
      },
    }
  );
  const videos = data?.videos;

  // ---- VIDEO DETAIL VIEW ----
  if (selectedVideoId) {
    return (
      <VideoDetail
        videoId={selectedVideoId}
        onBack={() => {
          setSelectedVideoId(null);
          utils.video.list.refetch();
        }}
      />
    );
  }

  // ---- PHOTO DETAIL VIEW ----
  if (selectedPhoto) {
    return (
      <PhotoDetail
        photoId={selectedPhoto.id}
        photoUrl={selectedPhoto.url}
        isPinned={selectedPhoto.is_pinned}
        onBack={() => {
          setSelectedPhoto(null);
          utils.image.list.refetch();
        }}
      />
    );
  }

  // ---- ASSETS GRID ----
  return (
    <div className="flex w-full flex-1 flex-col desktop-container">
      <Suspense><SearchParamsHandler onVideoId={setSelectedVideoId} /></Suspense>
      {/* Tab Switcher */}
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

      {/* Content Grid */}
      <div className="flex flex-1 flex-col overflow-y-auto" style={{ gap: 12, padding: "8px 16px 16px 16px" }}>
        {tab === "videos" ? (
          videos && videos.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 12 }}>
              {videos.map((video) => {
                const isFailed = video.status === "failed";
                const isGenerating = video.status === "generating" || video.status === "pending";
                const isCompleted = video.status === "completed";

                return (
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
                      <>
                        <Image src={video.input_image_url} alt="Video thumbnail" fill className="object-cover" unoptimized />
                        {/* Overlay for non-completed */}
                        {!isCompleted && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                            {isGenerating && (
                              <div className="flex flex-col items-center" style={{ gap: 6 }}>
                                <Loader2 style={{ width: 24, height: 24, color: "#E8A838", animation: "spin 1.5s linear infinite" }} strokeWidth={2} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: "#E8A838" }}>Processing</span>
                              </div>
                            )}
                            {isFailed && (
                              <div className="flex flex-col items-center" style={{ gap: 6 }}>
                                <XCircle style={{ width: 24, height: 24, color: "#EF4444" }} strokeWidth={1.5} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: "#EF4444" }}>Failed</span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : null}

                    {/* Bottom row: duration + status */}
                    <div className="absolute flex items-center" style={{ bottom: 8, left: 8, right: 8, gap: 4 }}>
                      {/* Duration Badge */}
                      <div style={{ borderRadius: 8, backgroundColor: "#00000080", padding: "3px 8px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#FFFFFF" }}>
                          0:{String(video.duration || 5).padStart(2, "0")}
                        </span>
                      </div>
                      {/* Status Badge */}
                      {isCompleted && (
                        <div className="flex items-center" style={{ borderRadius: 8, backgroundColor: "#22C55E30", padding: "3px 8px", gap: 3 }}>
                          <CheckCircle style={{ width: 10, height: 10, color: "#22C55E" }} strokeWidth={2} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#22C55E" }}>Done</span>
                        </div>
                      )}
                      {isFailed && (
                        <div className="flex items-center" style={{ borderRadius: 8, backgroundColor: "#EF444430", padding: "3px 8px", gap: 3 }}>
                          <XCircle style={{ width: 10, height: 10, color: "#EF4444" }} strokeWidth={2} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#EF4444" }}>Failed</span>
                        </div>
                      )}
                      {isGenerating && (
                        <div className="flex items-center" style={{ borderRadius: 8, backgroundColor: "#E8A83830", padding: "3px 8px", gap: 3 }}>
                          <Loader2 style={{ width: 10, height: 10, color: "#E8A838" }} strokeWidth={2} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#E8A838" }}>Processing</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 12 }}>
              <p style={{ fontSize: 14, color: "#6B6B70" }}>No videos yet</p>
              <p style={{ fontSize: 12, color: "#4A4A50" }}>Your generated videos will appear here</p>
            </div>
          )
        ) : (
          <PhotosGrid onSelectPhoto={setSelectedPhoto} />
        )}
      </div>
    </div>
  );
}
