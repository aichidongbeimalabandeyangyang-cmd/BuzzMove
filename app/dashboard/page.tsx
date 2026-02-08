"use client";

import { useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import Link from "next/link";
import { GeneratingPoller } from "@/components/video/generating-poller";

export default function DashboardPage() {
  const { data: creditData } = trpc.credit.getBalance.useQuery();
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Header bar */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Videos</h1>
          <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
            Your generated videos and history
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-[var(--secondary)] px-3 py-2.5">
            <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            <span className="text-sm font-medium tabular-nums">
              {formatCredits(creditData?.balance ?? 0)}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">cr</span>
          </div>
          <span className="rounded-full bg-[var(--primary-10)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] capitalize">
            {creditData?.plan ?? "free"}
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl font-semibold text-[var(--background)] active:scale-[0.98] px-4 py-3 text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Video
          </Link>
        </div>
      </div>

      {/* Video grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
            <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[var(--primary)]" />
          </div>
        </div>
      ) : videosData?.videos.length === 0 ? (
        <div className="rounded-2xl bg-[var(--card)] py-20 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)]">
            <svg className="h-6 w-6 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <p className="mb-2 text-lg font-semibold">No videos yet</p>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            Upload an image to create your first AI video
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl font-semibold text-[var(--background)] active:scale-[0.98] px-6 py-3.5 text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)" }}
          >
            Create Your First Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4">
          {videosData?.videos.map((video) => (
            <DashboardVideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardVideoCard({ video }: { video: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTogglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, []);

  if (video.status === "generating" || video.status === "pending") {
    return (
      <div className="group overflow-hidden rounded-2xl bg-[var(--card)] transition-all duration-300">
        <GeneratingPoller videoId={video.id} />
        <div className="p-3">
          <p className="line-clamp-1 text-xs text-[var(--foreground-80)]">
            {video.prompt || "No prompt"}
          </p>
        </div>
      </div>
    );
  }

  if (video.status === "completed" && video.output_video_url) {
    return (
      <div className="group overflow-hidden rounded-2xl bg-[var(--card)] transition-all duration-300">
        <div
          className="relative cursor-pointer"
          onClick={handleTogglePlay}
        >
          <video
            ref={videoRef}
            src={video.output_video_url}
            className="aspect-[9/16] w-full object-cover bg-[var(--secondary)]"
            muted
            loop
            playsInline
            preload="none"
          />
          {/* Play button overlay — always visible when paused */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-100 transition-opacity duration-200 group-hover:bg-black/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform group-hover:scale-110">
              <svg className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="line-clamp-1 text-xs text-[var(--foreground-80)]">
            {video.prompt || "No prompt"}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[11px] text-[var(--muted-foreground)]">
              {video.duration}s
            </span>
            <span className="rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[11px] text-[var(--muted-foreground)] capitalize">
              {video.mode}
            </span>
            <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">
              {video.credits_consumed} cr
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Failed / other status
  return (
    <div className="group overflow-hidden rounded-2xl bg-[var(--card)] transition-all duration-300">
      <div className="flex aspect-[9/16] items-center justify-center bg-[var(--secondary)]">
        <span className={`rounded-full px-3 py-1.5 text-xs ${
          video.status === "failed"
            ? "bg-[var(--destructive-10)] text-[var(--destructive)]"
            : "text-[var(--muted-foreground)]"
        }`}>
          {video.status === "failed" ? "Failed" : video.status}
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-xs text-[var(--foreground-80)]">
          {video.prompt || "No prompt"}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[11px] text-[var(--muted-foreground)]">
            {video.duration}s
          </span>
          <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">
            {video.credits_consumed} cr
          </span>
        </div>
      </div>
    </div>
  );
}
