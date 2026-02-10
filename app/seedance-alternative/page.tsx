import { LandingHero } from "@/components/landing/landing-hero";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { CtaSection } from "@/components/landing/cta-section";

export default function SeedanceAlternativePage() {
  return (
    <div style={{ maxWidth: 896, margin: "0 auto", padding: "24px 16px" }}>
      <LandingHero
        badge="Best Seedance Alternative"
        title={
          <>
            The Best{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F0C060, #E8A838)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Seedance Alternative
            </span>
            <br />
            — No Waitlist
          </>
        }
        subtitle="Seedance 2.0 has a waitlist and strict content filters. BuzzMove lets you generate AI videos from photos instantly — with AI audio, no restrictions, and no waiting."
        ctaText="Try BuzzMove Free"
      />

      <ComparisonTable
        competitorName="Seedance 2.0"
        rows={[
          { feature: "Availability", buzzmove: "Instant access", competitor: "Waitlist" },
          { feature: "AI Audio", buzzmove: "Built-in", competitor: "No audio" },
          { feature: "Content Filters", buzzmove: "Unrestricted", competitor: "Strict filters" },
          { feature: "Resolution", buzzmove: "1080p", competitor: "1080p" },
          { feature: "Video Length", buzzmove: "5s & 10s", competitor: "5s & 10s" },
          { feature: "Free Credits", buzzmove: "500 credits", competitor: "Limited trial" },
        ]}
      />

      {/* Why Switch */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 28, color: "#FAFAF9" }}>
          Why Creators Switch to BuzzMove
        </h2>
        <div className="grid" style={{ gap: 16, gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            {
              title: "Instant Access",
              desc: "No waitlist, no approval process. Sign up and start generating videos in seconds.",
            },
            {
              title: "AI Audio Built-in",
              desc: "Add speech and sound to your videos with a single prompt. No extra tools needed.",
            },
            {
              title: "No Restrictions",
              desc: "Create freely without content policy rejections. Your creativity, your rules.",
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

      <CtaSection
        title="Ready to Switch from Seedance?"
        subtitle="Start with 500 free credits. No credit card required."
        ctaText="Try BuzzMove Free"
      />
    </div>
  );
}
