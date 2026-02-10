import Link from "next/link";

interface CtaSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref?: string;
}

export function CtaSection({ title, subtitle, ctaText, ctaHref = "/" }: CtaSectionProps) {
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
      <Link
        href={ctaHref}
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
        {ctaText}
      </Link>
    </div>
  );
}
