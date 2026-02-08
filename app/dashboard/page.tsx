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
    <div className="mx-auto max-w-6xl px-5 py-12">
      {/* Header bar */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Videos</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Your generated videos and history
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            <span className="text-sm font-medium tabular-nums">
              {formatCredits(creditData?.balance ?? 0)}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">cr</span>
          </div>
          <span className="rounded-full border border-[var(--primary-20)] bg-[var(--primary-10)] px-2.5 py-1 text-xs font-medium text-[var(--primary)] capitalize">
            {creditData?.plan ?? "free"}
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl font-semibold text-[var(--background)] hover:brightness-110 active:scale-[0.98] px-4 py-2.5 text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)", boxShadow: "0 1px 8px rgba(232,168,56,0.2)" }}
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
        <div className="flex justify-center py-24">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
            <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[var(--primary)]" />
          </div>
        </div>
      ) : videosData?.videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] py-24 text-center animate-fade-up delay-200">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)]">
            <svg className="h-6 w-6 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 12 6 12.504 6 13.125" />
            </svg>
          </div>
          <p className="mb-2 text-lg font-semibold">No videos yet</p>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            Upload an image to create your first AI video
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl font-semibold text-[var(--background)] hover:brightness-110 active:scale-[0.98] px-6 py-3 text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)", boxShadow: "0 1px 8px rgba(232,168,56,0.2)" }}
          >
            Create Your First Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 animate-fade-up delay-200">
          {videosData?.videos.map((video) => (
            <div
              key={video.id}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--primary-30)]"
            >
              {video.status === "completed" && video.output_video_url ? (
                <div
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    const vid = e.currentTarget.querySelector("video");
                    if (!vid) return;
                    if (vid.paused) {
                      vid.play();
                    } else {
                      vid.pause();
                      vid.currentTime = 0;
                    }
                  }}
                >
                  <video
                    src={video.output_video_url}
                    className="aspect-[9/16] w-full object-cover"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) =>
                      (e.target as HTMLVideoElement).play()
                    }
                    onMouseLeave={(e) => {
                      const v = e.target as HTMLVideoElement;
                      v.pause();
                      v.currentTime = 0;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                      <svg className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                </div>
              ) : video.status === "generating" || video.status === "pending" ? (
                <GeneratingPoller videoId={video.id} />
              ) : (
                <div className="flex aspect-[9/16] items-center justify-center bg-[var(--secondary)]">
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    video.status === "failed"
                      ? "bg-[var(--destructive-10)] text-[var(--destructive)]"
                      : "bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)]"
                  }`}>
                    {video.status === "failed" ? "Failed" : video.status}
                  </span>
                </div>
              )}
              <div className="p-3">
                <p className="line-clamp-1 text-xs text-[var(--foreground-80)]">
                  {video.prompt || "No prompt"}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">
                    {video.duration}s
                  </span>
                  <span className="rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)] capitalize">
                    {video.mode}
                  </span>
                  <span className="ml-auto text-[10px] text-[var(--muted-foreground)]">
                    {video.credits_consumed} cr
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
