"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { VideoCard } from "@/components/video/video-card";

export default function ExplorerPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = trpc.video.explore.useQuery({
    limit: 20,
    offset,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Explore</h1>
        <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
          Discover AI-generated videos from the community
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
            <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[var(--primary)]" />
          </div>
        </div>
      ) : data?.videos.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--secondary)]">
            <svg className="h-5 w-5 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-lg font-semibold">No videos yet</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Be the first to create one!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4">
            {data?.videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {data && data.total > offset + 20 && (
            <div className="mt-8 sm:mt-10 flex justify-center">
              <button
                onClick={() => setOffset((o) => o + 20)}
                className="rounded-xl bg-[var(--secondary)] px-8 py-3 text-sm font-medium transition-all active:scale-[0.98] hover:bg-[var(--primary-10)] hover:text-[var(--primary)]"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
