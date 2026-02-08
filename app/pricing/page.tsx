"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const price = billing === "yearly" ? "$29.00" : "$35.00";
  const perLabel = "/month";
  const saveText = billing === "yearly" ? "Save $87/year — was $435" : null;

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* titleSection: gap 12, padding [16,20,24,20], center, width fill */}
      <div className="flex w-full flex-col items-center" style={{ gap: 12, padding: "16px 20px 24px 20px" }}>
        <h1 style={{ width: "100%", fontSize: 28, fontWeight: 700, letterSpacing: -0.8, color: "#FAFAF9", textAlign: "center" }}>
          Unleash your full creativity
        </h1>
        <p style={{ width: "100%", fontSize: 15, fontWeight: 400, color: "#6B6B70", textAlign: "center" }}>
          Choose the plan that fits your workflow.
        </p>
        {/* Toggle Row: cornerRadius 12, fill #16161A, gap 4, padding 4 */}
        <div className="flex" style={{ borderRadius: 12, backgroundColor: "#16161A", gap: 4, padding: 4 }}>
          <button
            onClick={() => setBilling("monthly")}
            className="flex items-center justify-center"
            style={{
              borderRadius: 10, padding: "8px 20px",
              fontSize: 14, fontWeight: billing === "monthly" ? 600 : 500,
              color: billing === "monthly" ? "#0B0B0E" : "#6B6B70",
              backgroundColor: billing === "monthly" ? "#E8A838" : "transparent",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className="flex items-center justify-center"
            style={{
              borderRadius: 10, padding: "8px 20px", gap: 6,
              fontSize: 14, fontWeight: billing === "yearly" ? 600 : 500,
              color: billing === "yearly" ? "#0B0B0E" : "#6B6B70",
              backgroundColor: billing === "yearly" ? "#E8A838" : "transparent",
            }}
          >
            Yearly
            {billing === "yearly" && (
              <span style={{ borderRadius: 8, backgroundColor: "#22C55E", padding: "2px 8px", fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                -20%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* plansArea: gap 16, padding [0,20], h-fill */}
      <div className="flex w-full flex-1 flex-col" style={{ gap: 16, padding: "0 20px 20px 20px" }}>
        {/* Pro Card Wrapper: cornerRadius 20, gradient border 1.5px */}
        <div className="w-full" style={{ borderRadius: 20, padding: 1.5, background: "linear-gradient(135deg, #F0C060, #E8A83850)" }}>
          {/* Pro Card: cornerRadius 19, fill #16161A, padding 20, gap 14 */}
          <div className="flex w-full flex-col" style={{ borderRadius: 19, backgroundColor: "#16161A", padding: 20, gap: 14 }}>
            {/* proTop: gap 8 */}
            <div className="flex w-full flex-col" style={{ gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Professional</span>
              <div className="flex items-center" style={{ gap: 8 }}>
                <div style={{ borderRadius: 6, backgroundColor: "#E8A83830", padding: "3px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "#E8A838" }}>MOST POPULAR</span>
                </div>
              </div>
            </div>

            {/* priceRow: gap 4 */}
            <div className="flex items-baseline" style={{ gap: 4 }}>
              <span style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1.5, color: "#FAFAF9", lineHeight: 1 }}>{price}</span>
              <span style={{ fontSize: 17, fontWeight: 400, color: "#6B6B70" }}>{perLabel}</span>
            </div>

            {saveText && <p style={{ fontSize: 17, fontWeight: 700, color: "#E8A838" }}>{saveText}</p>}

            {/* features: gap 10 */}
            <div className="flex w-full flex-col" style={{ gap: 10 }}>
              {["30,000 credits / month", "No waiting — priority processing", "No watermark · Commercial license"].map((f) => (
                <div key={f} className="flex items-center" style={{ gap: 10 }}>
                  <Check style={{ width: 16, height: 16, color: "#E8A838", flexShrink: 0 }} strokeWidth={1.5} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#FAFAF9" }}>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA: h48, cornerRadius 14, gradient + shadow */}
            <button
              className="flex w-full items-center justify-center transition-all active:scale-[0.98]"
              style={{ height: 48, borderRadius: 14, background: "linear-gradient(135deg, #F0C060, #E8A838)", boxShadow: "0 4px 20px #E8A83840" }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0B0B0E" }}>Upgrade to Pro</span>
            </button>

            <p style={{ width: "100%", fontSize: 14, fontWeight: 600, color: "#FAFAF9", textAlign: "center" }}>⏰  Offer ends Feb 28</p>
            <p style={{ width: "100%", fontSize: 12, fontWeight: 400, color: "#6B6B70", textAlign: "center" }}>Cancel anytime. No questions asked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
