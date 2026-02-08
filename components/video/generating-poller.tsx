"use client";

import { trpc } from "@/lib/trpc";

interface GeneratingPollerProps {
  videoId: string;
}

export function GeneratingPoller({ videoId }: GeneratingPollerProps) {
  // This query polls Kling API via getStatus, which updates DB when done
  trpc.video.getStatus.useQuery(
    { videoId },
    { refetchInterval: 5000 }
  );

  return (
    <div className="flex aspect-[9/16] items-center justify-center bg-[var(--secondary)]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin-slow rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        <span className="text-[10px] text-[var(--muted-foreground)]">Generating</span>
      </div>
    </div>
  );
}
