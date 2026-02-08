import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BuzzMove for Ads - Turn One Image into 10 Ad-Ready Videos",
  description:
    "Generate high-performing video ads from a single product image. Designed for ROAS. Minutes, not days.",
};

export default function AdsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20">
      {/* Hero */}
      <div className="mb-20 text-center">
        <div className="mb-4 inline-block rounded-full bg-[var(--primary-20)] px-4 py-1 text-sm font-medium text-[var(--accent)]">
          For Performance Marketers
        </div>
        <h1 className="mb-4 text-5xl font-bold leading-tight">
          Turn one image into
          <br />
          <span className="text-gradient">10 ad-ready videos</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-[var(--muted-foreground)] leading-relaxed">
          Generate scroll-stopping video ads from a single product image.
          Designed for ROAS. Minutes, not days.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl px-8 py-4 text-base font-semibold text-[var(--background)] transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)", boxShadow: "0 2px 16px rgba(232,168,56,0.25)" }}
        >
          Start Creating Ads
        </Link>
      </div>

      {/* Use cases */}
      <div className="mb-20 grid gap-6 md:grid-cols-3">
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
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mb-20">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Built for Performance
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
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
            <div key={item.title} className="flex gap-4 rounded-xl bg-[var(--secondary)] p-5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(232,168,56,0.12)" }}
              >
                <svg
                  className="h-5 w-5 text-[var(--primary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl p-12 text-center"
        style={{ background: "linear-gradient(135deg, #e8a838, #f0c060)" }}
      >
        <h2 className="mb-3 text-3xl font-bold text-[var(--background)]">
          Ready to Scale Your Creatives?
        </h2>
        <p className="mb-6 text-[var(--background)]/70">
          Start with free credits. No credit card required.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-[var(--background)] px-8 py-3 font-semibold text-[var(--foreground)] transition-all hover:bg-[#111] active:scale-[0.98]"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
