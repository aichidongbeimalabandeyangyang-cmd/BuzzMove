"use client";

import { useApp } from "@/components/layout/app-shell";

interface LandingCtaButtonProps {
  text: string;
  variant?: "primary" | "secondary";
}

export function LandingCtaButton({ text, variant = "primary" }: LandingCtaButtonProps) {
  const { openLogin } = useApp();

  if (variant === "secondary") {
    return (
      <button
        onClick={openLogin}
        style={{
          display: "inline-block",
          borderRadius: 12,
          padding: "12px 32px",
          fontWeight: 600,
          backgroundColor: "#0B0B0E",
          color: "#FAFAF9",
          border: "none",
          cursor: "pointer",
        }}
      >
        {text}
      </button>
    );
  }

  return (
    <button
      onClick={openLogin}
      style={{
        display: "inline-block",
        borderRadius: 12,
        padding: "14px 32px",
        fontSize: 16,
        fontWeight: 600,
        background: "linear-gradient(135deg, #F0C060, #E8A838)",
        color: "#0B0B0E",
        border: "none",
        cursor: "pointer",
      }}
    >
      {text}
    </button>
  );
}
