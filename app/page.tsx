"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles, Plus } from "lucide-react";
import { useApp } from "@/components/layout/app-shell";
import { UploadZone } from "@/components/upload/upload-zone";
import { trpc } from "@/lib/trpc";
import { VideoGenerator } from "@/components/video/video-generator";

const TAGLINES = [
  "Make her Move",
  "Let her Dance for me",
  "Dress with skirt",
  "Photo to Live",
  "Blow a kiss",
  "Wave and smile",
  "Turn around slowly",
];

const ROW_H = 30;
const VISIBLE_ROWS = 3; // top + center + bottom

function RotatingTaglines() {
  const [active, setActive] = useState(0);
  const [animate, setAnimate] = useState(true);
  const count = TAGLINES.length;

  // Build extended list: [...items, item0, item1] for seamless loop
  const extended = [...TAGLINES, ...TAGLINES.slice(0, 2)];

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Seamless reset: when we reach the clone boundary, snap back
  useEffect(() => {
    if (active === count) {
      const timer = setTimeout(() => {
        setAnimate(false);
        setActive(0);
        // Re-enable animation on next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
      }, 500); // wait for the transition to finish
      return () => clearTimeout(timer);
    }
  }, [active, count]);

  // The track shifts so that `active` aligns to the center row
  const offset = -(active * ROW_H);

  return (
    <div
      style={{
        height: ROW_H * VISIBLE_ROWS,
        overflow: "hidden",
        width: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          transform: `translateY(${offset + ROW_H}px)`, // +ROW_H so active sits in center
          transition: animate ? "transform 0.5s ease-in-out" : "none",
        }}
      >
        {extended.map((text, i) => {
          const dist = i - active; // -1 = top, 0 = center, 1 = bottom
          const isCenter = dist === 0;
          const isNear = dist === -1 || dist === 1;
          return (
            <div
              key={`${text}-${i}`}
              style={{
                height: ROW_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isCenter ? 16 : 13,
                fontWeight: isCenter ? 600 : 400,
                color: isCenter ? "#E8A838" : "#6B6B70",
                opacity: isCenter ? 1 : isNear ? 0.4 : 0,
                transition: animate
                  ? "font-size 0.5s ease, font-weight 0.5s ease, color 0.5s ease, opacity 0.5s ease"
                  : "none",
                letterSpacing: 0.3,
              }}
            >
              &ldquo;{text}&rdquo;
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Showcase content variants ----
const SHOWCASE_DEFAULT = {
  image: "/examples/showcase-default.png",
  video: "/examples/showcase-default.mp4",
  prompt: "Blowing a kiss, flirty expression, charming smile.",
};

const SHOWCASE_VARIANT = {
  image: "/examples/showcase.png",
  video: "/examples/showcase.mp4",
  prompt: "Blowing a kiss, flirty expression, charming smile.",
};

// Keywords in any URL param that trigger the variant showcase
const VARIANT_KEYWORDS = ["uncensored"];

const SHOWCASE_STORAGE_KEY = "buzzmove_showcase_variant";

function useShowcase() {
  const [showcase, setShowcase] = useState(SHOWCASE_DEFAULT);

  useEffect(() => {
    // Check sessionStorage first (persists across navigations in same session)
    const cached = sessionStorage.getItem(SHOWCASE_STORAGE_KEY);
    if (cached === "variant") {
      setShowcase(SHOWCASE_VARIANT);
      return;
    }
    if (cached === "default") return; // already resolved as default

    // Read URL params and check for keyword matches
    const params = new URLSearchParams(window.location.search);
    const allValues = [
      params.get("ref"),
      params.get("utm_source"),
      params.get("utm_medium"),
      params.get("utm_campaign"),
      params.get("utm_content"),
    ]
      .filter(Boolean)
      .map((v) => v!.toLowerCase());

    const matched = allValues.some((val) =>
      VARIANT_KEYWORDS.some((kw) => val.includes(kw))
    );

    if (matched) {
      setShowcase(SHOWCASE_VARIANT);
      sessionStorage.setItem(SHOWCASE_STORAGE_KEY, "variant");
    } else {
      sessionStorage.setItem(SHOWCASE_STORAGE_KEY, "default");
    }
  }, []);

  return showcase;
}

export default function HomePage() {
  const { homeView, setHomeView, user, openLogin } = useApp();
  const SHOWCASE = useShowcase();
  const utils = trpc.useUtils();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Showcase (guest only): idle → loading → playing
  const [showcase, setShowcase] = useState<"idle" | "loading" | "playing">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    if (!imageUrl && !imagePreview && showcase === "idle" && homeView !== "upload") {
      setHomeView("home");
    }
  }, [imageUrl, imagePreview, showcase]);

  // Reset showcase when navigating away (header back button / tab switch)
  useEffect(() => {
    if (homeView === "home" && showcase !== "idle") {
      setShowcase("idle");
    }
  }, [homeView]);

  // ---- File upload handler (logged-in only) ----
  const handleFileSelected = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url);
      // Optimistic: prepend to image list cache so it appears immediately
      utils.image.list.setData({ limit: 8 }, (prev) =>
        prev
          ? [{ id: `temp-${Date.now()}`, url: data.url, filename: file.name, created_at: new Date().toISOString() }, ...prev].slice(0, 8)
          : prev
      );
    } catch (err) {
      URL.revokeObjectURL(preview);
      setImagePreview(null);
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setInitialPrompt("");
    setUploadError(null);
    setHomeView("upload");
  };

  // =============================================
  // LOGGED-IN FLOWS
  // =============================================

  // ---- Video Generator (logged-in, has image) ----
  if (isLoggedIn && imageUrl && imagePreview) {
    return (
      <VideoGenerator
        imageUrl={imageUrl}
        imagePreview={imagePreview}
        onReset={handleReset}
        initialPrompt={initialPrompt}
      />
    );
  }

  // ---- Upload Photo (logged-in, explicit upload view) ----
  if (isLoggedIn && homeView === "upload") {
    return (
      <div className="flex w-full flex-1 flex-col" style={{ padding: "16px 16px 12px 16px" }}>
        {uploading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-[#252530]" />
              <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-[#E8A838]" />
            </div>
            <p style={{ fontSize: 14, color: "#6B6B70" }}>Uploading your image...</p>
          </div>
        ) : (
          <UploadZone
            onFileSelected={handleFileSelected}
            onExistingSelected={(url) => {
              setImageUrl(url);
              setImagePreview(url);
            }}
          />
        )}
        {uploadError && (
          <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-[#EF4444]">
            {uploadError}
          </div>
        )}
      </div>
    );
  }

  // ---- Logged-in Default: Upload-centric homepage ----
  if (isLoggedIn) {
    return (
      <div className="flex w-full flex-1 flex-col">
        {/* Upload hero area */}
        <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 24, padding: "40px 20px" }}>
          {/* Upload button */}
          <button
            onClick={() => setHomeView("upload")}
            className="flex flex-col items-center justify-center transition-all active:scale-[0.98]"
            style={{
              width: "100%",
              maxWidth: 340,
              height: 280,
              borderRadius: 24,
              border: "2px dashed #252530",
              backgroundColor: "#16161A",
              gap: 16,
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: 64, height: 64, borderRadius: 100, backgroundColor: "#E8A83815" }}
            >
              <Plus style={{ width: 28, height: 28, color: "#E8A838" }} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center" style={{ gap: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF9" }}>Upload a photo</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: "#6B6B70" }}>JPG, PNG up to 10 MB</span>
            </div>
          </button>

          {/* Rotating taglines */}
          <RotatingTaglines />
        </div>
      </div>
    );
  }

  // =============================================
  // GUEST (NOT LOGGED IN) FLOWS
  // =============================================

  // ---- Showcase: Loading (fake progress) ----
  if (showcase === "loading") {
    return (
      <div className="flex w-full flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 20, padding: "0 40px" }}>
          <div className="relative w-full overflow-hidden" style={{ height: 280, borderRadius: 20, backgroundColor: "#16161A" }}>
            <Image src={SHOWCASE.image} alt="Showcase" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} />
          </div>
          <div className="flex flex-col items-center" style={{ gap: 16, width: "100%" }}>
            <div className="relative" style={{ width: 48, height: 48 }}>
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
              <div className="absolute inset-0 animate-spin-slow rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Generating your video...</p>
            <div className="w-full overflow-hidden" style={{ height: 6, borderRadius: 100, backgroundColor: "#1A1A1E" }}>
              <div
                className="transition-all duration-[2000ms] ease-out"
                style={{ height: "100%", width: "100%", borderRadius: 100, background: "linear-gradient(90deg, #F0C060, #E8A838)" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Showcase: Playing (video result → CTA to sign up) ----
  if (showcase === "playing") {
    return (
      <div className="flex w-full flex-1 flex-col">
        <div className="flex flex-1 flex-col" style={{ gap: 20, padding: "8px 20px 20px 20px" }}>
          <div className="relative w-full overflow-hidden" style={{ height: 440, borderRadius: 20, flexShrink: 0 }}>
            <video
              ref={videoRef}
              src={SHOWCASE.video}
              controls
              autoPlay
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          {/* CTA: Try your own → opens login */}
          <button
            onClick={() => {
              setShowcase("idle");
              setHomeView("home");
              openLogin();
            }}
            className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
            style={{
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #F0C060, #E8A838)",
              boxShadow: "0 4px 20px #E8A83840",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0B0B0E" }}>Try with your own photo</span>
          </button>

          {/* Rotating taglines to reinforce CTA */}
          <RotatingTaglines />
        </div>
      </div>
    );
  }

  // ---- Guest Default Homepage (showcase) ----
  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Hero Photo: showcase image */}
      <div className="relative w-full overflow-hidden" style={{ height: 460, flexShrink: 0 }}>
        <Image
          src={SHOWCASE.image}
          alt="Showcase"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Label Badge */}
        <div
          className="absolute"
          style={{ left: 16, top: 16, zIndex: 10, borderRadius: 100, backgroundColor: "#00000099", padding: "6px 14px" }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFFCC", whiteSpace: "nowrap" }}>
            Example photo · Sign up to create your own
          </span>
        </div>
        {/* Gradient Overlay */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: 160, background: "linear-gradient(180deg, #0B0B0E00, #0B0B0E)" }}
        />
      </div>

      {/* Bottom Content */}
      <div
        className="flex w-full flex-col"
        style={{ flex: "1 1 0%", gap: 12, justifyContent: "flex-end", padding: "0 20px 24px 20px" }}
      >
        {/* Prompt Label */}
        <div className="flex items-center" style={{ gap: 6 }}>
          <Sparkles style={{ width: 16, height: 16, color: "#E8A838" }} strokeWidth={1.5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#E8A838" }}>Motion Prompt</span>
        </div>

        {/* Prompt Card */}
        <div style={{ borderRadius: 16, backgroundColor: "#16161A", padding: 16, width: "100%" }}>
          <p style={{ fontSize: 15, lineHeight: 1.4, color: "#FAFAF9" }}>
            {SHOWCASE.prompt}
          </p>
        </div>

        {/* Primary CTA: showcase demo (free, no login needed) */}
        <button
          onClick={handleShowcase}
          className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
          style={{
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            boxShadow: "0 4px 20px #E8A83840",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0B0B0E" }}>Make It Move · Free</span>
        </button>

        {/* Secondary CTA: upload → login */}
        <button
          onClick={openLogin}
          className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
          style={{ height: 48, borderRadius: 14, border: "1.5px solid #2A2A2E" }}
        >
          <span style={{ fontSize: 15, fontWeight: 500, color: "#FAFAF9" }}>Upload your own photo</span>
        </button>
      </div>
    </div>
  );

  // Showcase trigger
  function handleShowcase() {
    setShowcase("loading");
    setHomeView("progress");
    setTimeout(() => {
      setShowcase("playing");
      setHomeView("result");
    }, 2000);
  }
}
