"use client";

interface VideoCardProps {
  video: {
    id: string;
    output_video_url: string | null;
    prompt: string | null;
    created_at: string;
    aspect_ratio: string;
  };
}

export function VideoCard({ video }: VideoCardProps) {
  if (!video.output_video_url) return null;

  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all hover:border-[var(--muted-foreground)]">
      <div className="relative aspect-[9/16]">
        <video
          src={video.output_video_url}
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
          onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
          onMouseLeave={(e) => {
            const v = e.target as HTMLVideoElement;
            v.pause();
            v.currentTime = 0;
          }}
        />
      </div>
      {video.prompt && (
        <div className="p-3">
          <p className="line-clamp-2 text-xs text-[var(--muted-foreground)]">
            {video.prompt}
          </p>
        </div>
      )}
    </div>
  );
}
