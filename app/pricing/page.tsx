"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/components/layout/app-shell";
import { CREDIT_PACKS } from "@/lib/constants";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const { user, openLogin } = useApp();

  const subCheckout = trpc.payment.createSubscriptionCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });
  const packCheckout = trpc.payment.createCreditPackCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });

  const handleSubscribe = (plan: "pro" | "premium") => {
    if (!user) { openLogin(); return; }
    subCheckout.mutate({ plan, billingPeriod: billing });
  };

  const handleBuyPack = (packId: string) => {
    if (!user) { openLogin(); return; }
    packCheckout.mutate({ packId: packId as any });
  };

  const proPrice = billing === "yearly" ? "$15.99" : "$19.99";
  const premiumPrice = billing === "yearly" ? "$69.99" : "$69.99";
  const proPerLabel = billing === "yearly" ? "/mo, billed yearly" : "/month";
  const premiumPerLabel = billing === "yearly" ? "/mo, billed yearly" : "/month";

  return (
    <div className="flex w-full flex-1 flex-col overflow-y-auto desktop-container">
      {/* Title Section */}
      <div className="flex w-full flex-col items-center" style={{ gap: 12, padding: "16px 20px 24px 20px" }}>
        <h1 style={{ width: "100%", fontSize: 28, fontWeight: 700, letterSpacing: -0.8, color: "#FAFAF9", textAlign: "center" }}>
          Unleash your full creativity
        </h1>
        <p style={{ width: "100%", fontSize: 15, fontWeight: 400, color: "#6B6B70", textAlign: "center" }}>
          Choose the plan that fits your workflow.
        </p>

        {/* Billing Toggle */}
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

      {/* Plans + Packs */}
      <div className="flex w-full flex-col" style={{ gap: 16, padding: "0 20px 32px 20px" }}>

        {/* Plans row: side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row" style={{ gap: 16 }}>

        {/* ---- PRO PLAN (recommended) ---- */}
        <div className="w-full lg:flex-1" style={{ borderRadius: 20, padding: 1.5, background: "linear-gradient(135deg, #F0C060, #E8A83850)" }}>
          <div className="flex w-full flex-col" style={{ borderRadius: 19, backgroundColor: "#16161A", padding: 20, gap: 14 }}>
            <div className="flex w-full flex-col" style={{ gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Pro</span>
              <div style={{ borderRadius: 6, backgroundColor: "#E8A83830", padding: "3px 10px", alignSelf: "flex-start" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "#E8A838" }}>RECOMMENDED</span>
              </div>
            </div>

            <div className="flex items-baseline" style={{ gap: 4 }}>
              <span style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1.5, color: "#FAFAF9", lineHeight: 1 }}>{proPrice}</span>
              <span style={{ fontSize: 15, fontWeight: 400, color: "#6B6B70" }}>{proPerLabel}</span>
            </div>

            {billing === "yearly" && (
              <p style={{ fontSize: 14, fontWeight: 600, color: "#E8A838" }}>
                $191.90/year — Save $48 vs monthly
              </p>
            )}

            <div className="flex w-full flex-col" style={{ gap: 10 }}>
              {[
                "4,000 credits every month",
                "Watermark-free HD downloads",
                "Generate 3 videos in parallel",
                "Commercial license included",
              ].map((f) => (
                <div key={f} className="flex items-center" style={{ gap: 10 }}>
                  <Check style={{ width: 16, height: 16, color: "#E8A838", flexShrink: 0 }} strokeWidth={1.5} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#FAFAF9" }}>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe("pro")}
              disabled={subCheckout.isPending}
              className="flex w-full items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ height: 48, borderRadius: 14, background: "linear-gradient(135deg, #F0C060, #E8A838)", boxShadow: "0 4px 20px #E8A83840" }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0B0B0E" }}>
                {subCheckout.isPending ? "Loading..." : "Upgrade to Pro"}
              </span>
            </button>
          </div>
        </div>

        {/* ---- PREMIUM PLAN ---- */}
        <div className="w-full lg:flex-1" style={{ borderRadius: 20, backgroundColor: "#16161A", padding: 20 }}>
          <div className="flex w-full flex-col" style={{ gap: 14 }}>
            <div className="flex w-full flex-col" style={{ gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Premium</span>
              <div style={{ borderRadius: 6, backgroundColor: "#22C55E30", padding: "3px 10px", alignSelf: "flex-start" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "#22C55E" }}>BEST VALUE</span>
              </div>
            </div>

            <div className="flex items-baseline" style={{ gap: 4 }}>
              <span style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1.5, color: "#FAFAF9", lineHeight: 1 }}>{premiumPrice}</span>
              <span style={{ fontSize: 15, fontWeight: 400, color: "#6B6B70" }}>{premiumPerLabel}</span>
            </div>

            {billing === "yearly" && (
              <p style={{ fontSize: 14, fontWeight: 600, color: "#22C55E" }}>
                $839.90/year — Save $168 vs monthly
              </p>
            )}

            <div className="flex w-full flex-col" style={{ gap: 10 }}>
              {[
                "17,500 credits every month",
                "Watermark-free HD downloads",
                "Generate up to 10 videos at once",
                "Commercial license included",
                "30% cheaper credits vs packs",
              ].map((f) => (
                <div key={f} className="flex items-center" style={{ gap: 10 }}>
                  <Check style={{ width: 16, height: 16, color: "#22C55E", flexShrink: 0 }} strokeWidth={1.5} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#FAFAF9" }}>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe("premium")}
              disabled={subCheckout.isPending}
              className="flex w-full items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ height: 48, borderRadius: 14, backgroundColor: "#1E1E24", border: "1.5px solid #E8A83850" }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#FAFAF9" }}>
                {subCheckout.isPending ? "Loading..." : "Upgrade to Premium"}
              </span>
            </button>
          </div>
        </div>

        </div>{/* end plans row */}

        {/* ---- CREDIT PACKS ---- */}
        <div className="flex w-full flex-col" style={{ gap: 12, marginTop: 8 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Zap style={{ width: 18, height: 18, color: "#E8A838" }} strokeWidth={1.5} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF9" }}>Credit Packs</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 400, color: "#6B6B70" }}>
            One-time purchase. No subscription needed.
          </p>

          <div className="flex flex-col lg:grid lg:grid-cols-2" style={{ gap: 10 }}>
            {CREDIT_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handleBuyPack(pack.id)}
                disabled={packCheckout.isPending}
                className="flex w-full items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ borderRadius: 16, backgroundColor: "#16161A", padding: "14px 16px" }}
              >
                <div className="flex flex-col" style={{ gap: 3 }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>{pack.name}</span>
                    {pack.tag && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#E8A838", backgroundColor: "#E8A83820", borderRadius: 6, padding: "2px 6px" }}>
                        {pack.tag}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#6B6B70" }}>
                    {pack.credits.toLocaleString()} credits{pack.savings ? ` · Save ${pack.savings}%` : ""}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center"
                  style={{ borderRadius: 10, backgroundColor: "#E8A83815", padding: "6px 14px" }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#E8A838" }}>
                    ${(pack.price / 100).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ width: "100%", fontSize: 12, fontWeight: 400, color: "#6B6B70", textAlign: "center", marginTop: 8 }}>
          Cancel anytime. No questions asked. All prices in USD.
        </p>
      </div>
    </div>
  );
}
