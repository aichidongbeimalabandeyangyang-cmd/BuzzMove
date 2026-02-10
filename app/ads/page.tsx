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
    <div style={{ maxWidth: 896, margin: "0 auto", padding: "24px 16px" }}>
      {/* Hero */}
      <div style={{ marginBottom: 64, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            borderRadius: 9999,
            padding: "4px 16px",
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 16,
            backgroundColor: "rgba(232,168,56,0.12)",
            color: "#E8A838",
          }}
        >
          For Performance Marketers
        </div>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 16,
            color: "#FAFAF9",
          }}
        >
          Turn one image into
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #F0C060, #E8A838)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            10 ad-ready videos
          </span>
        </h1>
        <p
          style={{
            maxWidth: 560,
            margin: "0 auto 32px auto",
            fontSize: 16,
            lineHeight: 1.6,
            color: "#9898A4",
          }}
        >
          Generate scroll-stopping video ads from a single product image.
          Designed for ROAS. Minutes, not days.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            borderRadius: 12,
            padding: "14px 32px",
            fontSize: 16,
            fontWeight: 600,
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            color: "#0B0B0E",
            textDecoration: "none",
          }}
        >
          Start Creating Ads
        </Link>
      </div>

      {/* Use cases */}
      <div
        className="grid"
        style={{
          marginBottom: 64,
          gap: 16,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
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
            style={{
              borderRadius: 16,
              padding: 20,
              backgroundColor: "#16161A",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
                color: "#FAFAF9",
              }}
            >
              {item.title}
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B6B70" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ marginBottom: 64 }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 28,
            color: "#FAFAF9",
          }}
        >
          Built for Performance
        </h2>
        <div
          className="grid"
          style={{ gap: 14, gridTemplateColumns: "repeat(2, 1fr)" }}
        >
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
            <div
              key={item.title}
              className="flex"
              style={{
                gap: 16,
                borderRadius: 16,
                padding: 18,
                backgroundColor: "#16161A",
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 12,
                  backgroundColor: "rgba(232,168,56,0.12)",
                }}
              >
                <svg
                  style={{ width: 20, height: 20 }}
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
                <h3 style={{ fontWeight: 700, color: "#FAFAF9", marginBottom: 4 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: "#6B6B70" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          borderRadius: 16,
          padding: "40px 48px",
          textAlign: "center",
          background: "linear-gradient(135deg, #E8A838, #F0C060)",
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 12,
            color: "#0B0B0E",
          }}
        >
          Ready to Scale Your Creatives?
        </h2>
        <p style={{ marginBottom: 24, color: "rgba(11,11,14,0.7)" }}>
          Start with free credits. No credit card required.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            borderRadius: 12,
            padding: "12px 32px",
            fontWeight: 600,
            backgroundColor: "#0B0B0E",
            color: "#FAFAF9",
            textDecoration: "none",
          }}
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
