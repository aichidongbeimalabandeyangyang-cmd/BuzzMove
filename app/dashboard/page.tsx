"use client";

import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { data: creditData } = trpc.credit.getBalance.useQuery();
  const { data: videosData, isLoading } = trpc.video.list.useQuery({
    limit: 20,
    offset: 0,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Stats bar */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Videos</h1>
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-[var(--secondary)] px-4 py-2">
            <span className="text-xs text-[var(--muted-foreground)]">
              Credits:{" "}
            </span>
            <span className="font-bold">
              {formatCredits(creditData?.balance ?? 0)}
            </span>
          </div>
          <span className="rounded-full bg-[var(--primary)]/20 px-3 py-1 text-xs font-medium text-[var(--accent)]">
            {creditData?.plan ?? "free"} plan
          </span>
          <Link
            href="/"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)] transition-colors"
          >
            + New Video
          </Link>
        </div>
      </div>

      {/* Video grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : videosData?.videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] py-20 text-center">
          <p className="mb-4 text-[var(--muted-foreground)]">
            You haven&apos;t created any videos yet
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent)] transition-colors"
          >
            Create Your First Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {videosData?.videos.map((video) => (
            <div
              key={video.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
            >
              {video.status === "completed" && video.output_video_url ? (
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
              ) : (
                <div className="flex aspect-[9/16] items-center justify-center bg-[var(--secondary)]">
                  {video.status === "generating" ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
                  ) : video.status === "failed" ? (
                    <span className="text-xs text-[var(--destructive)]">
                      Failed
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Pending
                    </span>
                  )}
                </div>
              )}
              <div className="p-3">
                <p className="line-clamp-1 text-xs text-[var(--muted-foreground)]">
                  {video.prompt || "No prompt"}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                  {video.duration}s &middot; {video.mode} &middot;{" "}
                  {video.credits_consumed} credits
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
