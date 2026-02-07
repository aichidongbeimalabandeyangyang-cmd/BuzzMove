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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Discover AI-generated videos from the community
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : data?.videos.length === 0 ? (
        <div className="py-20 text-center text-[var(--muted-foreground)]">
          No videos yet. Be the first to create one!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {data?.videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {data && data.total > offset + 20 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setOffset((o) => o + 20)}
                className="rounded-lg border border-[var(--border)] px-6 py-2 text-sm hover:bg-[var(--secondary)] transition-colors"
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
