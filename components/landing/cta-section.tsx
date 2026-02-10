import { LandingCtaButton } from "./landing-cta-button";

interface CtaSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
}

export function CtaSection({ title, subtitle, ctaText }: CtaSectionProps) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "40px 48px",
        textAlign: "center",
        background: "linear-gradient(135deg, #E8A838, #F0C060)",
      }}
    >
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: "#0B0B0E" }}>
        {title}
      </h2>
      <p style={{ marginBottom: 24, color: "rgba(11,11,14,0.7)" }}>
        {subtitle}
      </p>
      <LandingCtaButton text={ctaText} variant="secondary" />
    </div>
  );
}
