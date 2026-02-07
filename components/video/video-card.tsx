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
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--primary-30)] hover:shadow-lg hover:shadow-black/10">
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
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {video.prompt && (
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="line-clamp-2 text-xs text-white/80 drop-shadow-sm">
            {video.prompt}
          </p>
        </div>
      )}
    </div>
  );
}
