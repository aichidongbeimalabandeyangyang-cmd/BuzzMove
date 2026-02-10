import { LandingHero } from "@/components/landing/landing-hero";
import { StepsSection } from "@/components/landing/steps-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function Seedance2VideoGeneratorPage() {
  return (
    <div style={{ maxWidth: 896, margin: "0 auto", padding: "24px 16px" }}>
      <LandingHero
        badge="AI Video Generator"
        title={
          <>
            AI Video Generator
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #F0C060, #E8A838)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Powered by Next-Gen AI
            </span>
          </>
        }
        subtitle="Transform any photo into a cinematic AI video with speech and sound. Powered by the same technology as Seedance 2.0 — available instantly, no waitlist."
        ctaText="Generate Your First Video"
      />

      {/* Features */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 28, color: "#FAFAF9" }}>
          Everything You Need
        </h2>
        <div className="grid" style={{ gap: 14, gridTemplateColumns: "repeat(2, 1fr)" }}>
          {[
            {
              title: "Image to Video",
              desc: "Upload any photo and watch it come to life with realistic motion and physics.",
            },
            {
              title: "AI Audio & Speech",
              desc: "Add dialogue, narration, or sound effects directly in your prompt.",
            },
            {
              title: "1080p HD Output",
              desc: "Professional quality exports ready for social media, ads, and presentations.",
            },
            {
              title: "5s & 10s Duration",
              desc: "Choose the perfect length for your content — short hooks or longer narratives.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex"
              style={{ gap: 16, borderRadius: 16, padding: 18, backgroundColor: "#16161A" }}
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
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="#E8A838">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "#FAFAF9", marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#6B6B70" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <StepsSection
        steps={[
          { number: "1", title: "Upload a Photo", description: "Any image works — product shots, portraits, landscapes, illustrations." },
          { number: "2", title: "Write a Prompt", description: "Describe the motion, speech, or sound you want. Or leave it blank for auto-animation." },
          { number: "3", title: "Generate & Download", description: "Get your HD video in under 2 minutes. Download and share anywhere." },
        ]}
      />

      {/* Pricing teaser */}
      <div style={{ marginBottom: 64, textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: "#FAFAF9" }}>
          Simple, Credit-Based Pricing
        </h2>
        <p style={{ maxWidth: 480, margin: "0 auto 24px auto", fontSize: 15, lineHeight: 1.6, color: "#6B6B70" }}>
          Start free with 500 credits. A 5-second silent video costs 100 credits.
          Add audio for 200 credits. No subscriptions required.
        </p>
        <div className="grid" style={{ gap: 12, gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 480, margin: "0 auto" }}>
          {[
            { label: "5s Silent", credits: "100 credits" },
            { label: "5s Audio", credits: "200 credits" },
            { label: "10s Silent", credits: "200 credits" },
            { label: "10s Audio", credits: "400 credits" },
          ].map((item) => (
            <div key={item.label} style={{ borderRadius: 12, padding: "12px 16px", backgroundColor: "#16161A" }}>
              <div style={{ fontSize: 14, color: "#6B6B70", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#E8A838" }}>{item.credits}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaSection
        title="Generate Your First Video"
        subtitle="500 free credits on signup. No credit card required."
        ctaText="Start Generating Free"
      />
    </div>
  );
}
