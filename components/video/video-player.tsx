"use client";

import { useState } from "react";
import { Download, Share2, RefreshCw, Lock, Home } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PaywallModal } from "@/components/paywall-modal";
import { trackVideoDownload, trackShareClick } from "@/lib/gtag";

interface VideoPlayerProps {
  videoId: string;
  onReset?: () => void;
  onBackHome?: () => void;
  creditCost?: number;
}

export function VideoPlayer({ videoId, onReset, onBackHome, creditCost }: VideoPlayerProps) {
  const { data: video } = trpc.video.getStatus.useQuery({ videoId });
  const { data: creditData } = trpc.credit.getBalance.useQuery();
  const [showPaywall, setShowPaywall] = useState(false);

  const isPaid = creditData?.hasPurchased ?? false;

  if (!video?.output_video_url) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <p style={{ fontSize: 14, color: "#6B6B70" }}>Video not ready</p>
      </div>
    );
  }

  const handleShare = async () => {
    trackShareClick();
    if (navigator.share) {
      try { await navigator.share({ title: "Check out my AI video!", url: video.output_video_url }); } catch {}
    } else {
      await navigator.clipboard.writeText(video.output_video_url);
    }
  };

  const handleDownload = () => {
    if (!isPaid) {
      setShowPaywall(true);
      return;
    }
    trackVideoDownload();
    const a = document.createElement("a");
    a.href = video.output_video_url;
    a.download = "";
    a.click();
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Result Body: centered on desktop */}
      <div className="flex flex-1 flex-col desktop-container" style={{ gap: 20, padding: "8px 20px 20px 20px" }}>
        {/* Video Player */}
        <div className="relative w-full overflow-hidden lg:max-w-2xl lg:mx-auto" style={{ borderRadius: 20, flexShrink: 0 }}>
          <video src={video.output_video_url} controls autoPlay loop playsInline className="w-full h-auto max-h-[45vh] lg:max-h-[65vh] object-contain" style={{ borderRadius: 20 }} />
        </div>

        {/* Action Row */}
        <div className="flex lg:max-w-2xl lg:mx-auto lg:w-full" style={{ gap: 10 }}>
          {/* Download */}
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
          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
            style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", gap: 8 }}
          >
            <Share2 style={{ width: 20, height: 20, color: "#FAFAF9" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Share</span>
          </button>
        </div>

        {/* Regenerate */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex w-full items-center justify-center transition-all active:scale-[0.98] lg:max-w-2xl lg:mx-auto"
            style={{ height: 48, borderRadius: 14, border: "1.5px solid #252530", gap: 8 }}
          >
            <RefreshCw style={{ width: 18, height: 18, color: "#FAFAF9" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Regenerate · {creditCost || 300} credits</span>
          </button>
        )}

        {/* Back to Home */}
        {onBackHome && (
          <button
            onClick={onBackHome}
            className="flex w-full items-center justify-center transition-all active:scale-[0.98] lg:max-w-2xl lg:mx-auto"
            style={{ height: 48, borderRadius: 14, gap: 8 }}
          >
            <Home style={{ width: 18, height: 18, color: "#6B6B70" }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#6B6B70" }}>Back to Home</span>
          </button>
        )}
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} context="download" />
    </div>
  );
}
