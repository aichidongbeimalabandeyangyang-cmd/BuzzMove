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
    <div className="group overflow-hidden rounded-2xl bg-[var(--card)] transition-all duration-300 hover:ring-1 hover:ring-[var(--primary-30)]">
      <div
        className="relative aspect-[9/16] cursor-pointer"
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

        {/* Play button — visible by default, hidden on desktop hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-300 sm:group-hover:opacity-0 pointer-events-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <svg className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Prompt — always visible on mobile, hover-only on desktop */}
      {video.prompt && (
        <div className="p-2.5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-3 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100 sm:bg-gradient-to-t sm:from-black/70 sm:to-transparent">
          <p className="line-clamp-1 text-xs text-[var(--foreground-80)] sm:text-white sm:line-clamp-2 sm:drop-shadow-md">
            {video.prompt}
          </p>
        </div>
      )}
    </div>
  );
}
