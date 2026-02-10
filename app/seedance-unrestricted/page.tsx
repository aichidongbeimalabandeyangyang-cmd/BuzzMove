import { LandingHero } from "@/components/landing/landing-hero";
import { ShowcaseDemo } from "@/components/landing/showcase-demo";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { CtaSection } from "@/components/landing/cta-section";

export default function SeedanceUnrestrictedPage() {
  return (
    <div style={{ maxWidth: 896, margin: "0 auto", padding: "24px 16px" }}>
      <LandingHero
        badge="Unrestricted AI Video"
        title={
          <>
            Unrestricted AI Video Generator
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #F0C060, #E8A838)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              No Content Filters
            </span>
          </>
        }
        subtitle="Tired of content policy rejections on Seedance, Sora, or Runway? BuzzMove lets you create AI videos without restrictions — with built-in audio."
        ctaText="Start Creating Freely"
      />

      <ShowcaseDemo
        title="Create Without Limits"
        subtitle="No content filters. No prompt rejections. Just your creativity."
      />

      {/* Pain points */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 12, color: "#FAFAF9" }}>
          Tired of This?
        </h2>
        <p style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 28px auto", fontSize: 15, lineHeight: 1.6, color: "#6B6B70" }}>
          Most AI video generators reject your prompts before you even start.
          Content filters block creative, artistic, and commercial use cases.
        </p>
        <div className="grid" style={{ gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            "\"Your prompt violates our content policy\"",
            "\"This image was flagged for review\"",
            "\"Generation failed: content not allowed\"",
          ].map((msg) => (
            <div
              key={msg}
              style={{
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 14,
                fontStyle: "italic",
                color: "#EF4444",
                backgroundColor: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Differentiators */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 28, color: "#FAFAF9" }}>
          BuzzMove Is Different
        </h2>
        <div className="grid" style={{ gap: 16, gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            {
              title: "No Content Filters",
              desc: "Create any content you can imagine. No prompt rejections, no image flagging.",
            },
            {
              title: "AI Audio & Speech",
              desc: "Add dialogue, narration, and sound effects. Prompt speech directly in your video.",
            },
            {
              title: "Private & Secure",
              desc: "Your uploads and generations are private. No data sharing, no content moderation logs.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{ borderRadius: 16, padding: 20, backgroundColor: "#16161A" }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#FAFAF9" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B6B70" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ComparisonTable
        competitorName="Seedance / Sora"
        rows={[
          { feature: "Content Filters", buzzmove: "None", competitor: "Strict" },
          { feature: "Prompt Rejections", buzzmove: "Never", competitor: "Frequent" },
          { feature: "AI Audio", buzzmove: "Built-in", competitor: "Not available" },
          { feature: "Privacy", buzzmove: "No moderation logs", competitor: "Content reviewed" },
          { feature: "Availability", buzzmove: "Instant", competitor: "Waitlist / limited" },
        ]}
      />

      <CtaSection
        title="Create Without Limits"
        subtitle="500 free credits. No content filters. No credit card required."
        ctaText="Start Creating Freely"
      />
    </div>
  );
}
