import { LandingCtaButton } from "./landing-cta-button";

interface LandingHeroProps {
  badge?: string;
  title: React.ReactNode;
  subtitle: string;
  ctaText: string;
}

export function LandingHero({ badge, title, subtitle, ctaText }: LandingHeroProps) {
  return (
    <div style={{ marginBottom: 64, textAlign: "center" }}>
      {badge && (
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
          {badge}
        </div>
      )}
      <h1 style={{ fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 16, color: "#FAFAF9" }}>
        {title}
      </h1>
      <p style={{ maxWidth: 560, margin: "0 auto 32px auto", fontSize: 16, lineHeight: 1.6, color: "#9898A4" }}>
        {subtitle}
      </p>
      <LandingCtaButton text={ctaText} />
    </div>
  );
}
