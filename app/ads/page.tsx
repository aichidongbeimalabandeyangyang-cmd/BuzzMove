import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BuzzMove for Ads - Turn One Image into 10 Ad-Ready Videos",
  description:
    "Generate high-performing video ads from a single product image. Designed for ROAS. Minutes, not days.",
  alternates: { canonical: "https://buzzmove.me/ads" },
};

export default function AdsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12">
      {/* Hero */}
      <div className="mb-12 sm:mb-20 text-center">
        <div
          className="mb-4 inline-block rounded-full px-4 py-1 text-sm font-medium"
          style={{ backgroundColor: "rgba(232,168,56,0.12)", color: "#E8A838" }}
        >
          For Performance Marketers
        </div>
        <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-5xl">
          Turn one image into
          <br />
          <span style={{ background: "linear-gradient(135deg, #F0C060, #E8A838)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            10 ad-ready videos
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: "#9898A4" }}>
          Generate scroll-stopping video ads from a single product image.
          Designed for ROAS. Minutes, not days.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl px-8 py-4 text-base font-semibold transition-all active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #F0C060, #E8A838)", color: "#0B0B0E" }}
        >
          Start Creating Ads
        </Link>
      </div>

      {/* Use cases */}
      <div className="mb-12 sm:mb-20 grid gap-4 sm:gap-6 md:grid-cols-3">
        {[
          {
            title: "DTC Brands",
            desc: "Weekly creative batches for TikTok, Reels, and Shorts without a production team.",
          },
          {
            title: "Agencies",
            desc: "10x your creative output. Serve more clients with AI-powered video generation.",
          },
          {
            title: "UGC Creators",
            desc: "Turn product photos into dynamic video concepts. Deliver faster, earn more.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl p-5 sm:p-6"
            style={{ backgroundColor: "#16161A" }}
          >
            <h3 className="mb-2 text-lg font-bold" style={{ color: "#FAFAF9" }}>{item.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#6B6B70" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mb-12 sm:mb-20">
        <h2 className="mb-6 sm:mb-8 text-center text-2xl font-bold sm:text-3xl">
          Built for Performance
        </h2>
        <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
          {[
            {
              title: "Native Ad Formats",
              desc: "9:16, 1:1, 16:9 — optimized for every platform.",
            },
            {
              title: "Commercial License",
              desc: "All paid plans include full commercial usage rights.",
            },
            {
              title: "HD Quality",
              desc: "1080p export ready for ad platforms. No quality loss.",
            },
            {
              title: "Same-Day Delivery",
              desc: "From upload to ad-ready video in under 2 minutes.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 rounded-2xl p-4 sm:p-5" style={{ backgroundColor: "#16161A" }}>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "rgba(232,168,56,0.12)" }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#E8A838"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold" style={{ color: "#FAFAF9" }}>{item.title}</h3>
                <p className="text-sm" style={{ color: "#6B6B70" }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl p-8 sm:p-12 text-center"
        style={{ background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
      >
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ color: "#0B0B0E" }}>
          Ready to Scale Your Creatives?
        </h2>
        <p className="mb-6" style={{ color: "rgba(11,11,14,0.7)" }}>
          Start with free credits. No credit card required.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl px-8 py-3 font-semibold transition-all active:scale-[0.98]"
          style={{ backgroundColor: "#0B0B0E", color: "#FAFAF9" }}
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
