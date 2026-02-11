"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/components/layout/app-shell";
import { CREDIT_PACKS, PLANS } from "@/lib/constants";
import { trackClickCheckout } from "@/lib/gtag";
import { trackTikTokInitiateCheckout } from "@/lib/tiktok";
import { trackFacebookInitiateCheckout } from "@/lib/facebook";
import { getGoogleAdsIds } from "@/lib/google-ads-ids";
import { getTikTokAdsIds } from "@/lib/tiktok-ads-ids";
import { getFacebookAdsIds } from "@/lib/facebook-ads-ids";

export default function PricingPage() {
  const [billing, setBilling] = useState<"weekly" | "yearly">("weekly");
  const { user, openLogin } = useApp();

  const creditData = trpc.credit.getBalance.useQuery(undefined, { enabled: !!user });
  const hasPurchased = creditData.data?.hasPurchased ?? false;

  const subCheckout = trpc.payment.createSubscriptionCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });
  const packCheckout = trpc.payment.createCreditPackCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });

  const handleSubscribe = (plan: "pro" | "premium") => {
    if (!user) { openLogin(); return; }
    const withTrial = plan === "pro" && billing === "weekly" && !hasPurchased;
    
    // Calculate price
    let price = 0;
    if (plan === "pro") {
      price = withTrial 
        ? PLANS.pro.trial_price_weekly / 100 
        : (billing === "weekly" ? PLANS.pro.price_weekly / 100 : PLANS.pro.price_yearly / 100);
    } else {
      price = billing === "weekly" ? PLANS.premium.price_weekly / 100 : PLANS.premium.price_yearly / 100;
    }
    
    const planName = `BuzzMove ${plan === "pro" ? "Pro" : "Premium"} Plan (${billing})`;
    
    trackClickCheckout({ type: "subscription", plan });
    trackTikTokInitiateCheckout({
      content_type: "subscription",
      content_name: planName,
      value: price,
      currency: "USD",
    });
    trackFacebookInitiateCheckout({
      content_type: "subscription",
      content_name: planName,
      value: price,
      currency: "USD",
    });
    
    const gads = getGoogleAdsIds();
    const tads = getTikTokAdsIds();
    const fads = getFacebookAdsIds();
    subCheckout.mutate({
      plan, billingPeriod: billing, withTrial,
      gclid: gads.gclid, gbraid: gads.gbraid, wbraid: gads.wbraid,
      ttclid: tads.ttclid,
      fbclid: fads.fbclid, fbp: fads.fbp, fbc: fads.fbc,
    });
  };

  const handleBuyPack = (packId: string) => {
    if (!user) { openLogin(); return; }
    const pack = CREDIT_PACKS.find(p => p.id === packId);
    if (!pack) return;
    
    const price = pack.price / 100;
    const packName = `${pack.name} (${pack.credits} credits)`;
    
    trackClickCheckout({ type: "credit_pack", plan: packId });
    trackTikTokInitiateCheckout({
      content_type: "product",
      content_name: packName,
      value: price,
      currency: "USD",
    });
    trackFacebookInitiateCheckout({
      content_type: "product",
      content_name: packName,
      value: price,
      currency: "USD",
    });
    
    const gads = getGoogleAdsIds();
    const tads = getTikTokAdsIds();
    const fads = getFacebookAdsIds();
    packCheckout.mutate({
      packId: packId as any,
      gclid: gads.gclid, gbraid: gads.gbraid, wbraid: gads.wbraid,
      ttclid: tads.ttclid,
      fbclid: fads.fbclid, fbp: fads.fbp, fbc: fads.fbc,
    });
  };

  // Pro trial: $0.99 first week for new users
  const showProTrial = billing === "weekly" && !hasPurchased;
  const proPrice = showProTrial ? "$0.99" : billing === "yearly" ? "$3.56" : "$4.99";
  const proPerLabel = showProTrial ? " first week" : billing === "yearly" ? "/wk, billed yearly" : "/week";
  const premiumPrice = billing === "yearly" ? "$10.58" : "$14.99";
  const premiumPerLabel = billing === "yearly" ? "/wk, billed yearly" : "/week";

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
            onClick={() => setBilling("weekly")}
            className="flex items-center justify-center"
            style={{
              borderRadius: 10, padding: "8px 20px",
              fontSize: 14, fontWeight: billing === "weekly" ? 600 : 500,
              color: billing === "weekly" ? "#0B0B0E" : "#6B6B70",
              backgroundColor: billing === "weekly" ? "#E8A838" : "transparent",
            }}
          >
            Weekly
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
            <span style={{
              borderRadius: 8, padding: "2px 8px", fontSize: 13, fontWeight: 800,
              backgroundColor: billing === "yearly" ? "#22C55E" : "#22C55E20",
              color: billing === "yearly" ? "#FFFFFF" : "#22C55E",
            }}>
              -29%
            </span>
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
              <div className="flex items-center flex-wrap" style={{ gap: 6 }}>
                <div style={{ borderRadius: 6, backgroundColor: "#E8A83830", padding: "3px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "#E8A838" }}>RECOMMENDED</span>
                </div>
                {showProTrial && (
                  <div style={{ borderRadius: 8, backgroundColor: "#22C55E", padding: "4px 12px" }}>
                    <span style={{ fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 0.3, color: "#FFFFFF" }}>$0.99 FIRST WEEK</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline" style={{ gap: 4 }}>
              <span style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1.5, color: "#FAFAF9", lineHeight: 1 }}>{proPrice}</span>
              <span style={{ fontSize: 15, fontWeight: 400, color: "#6B6B70" }}>{proPerLabel}</span>
            </div>

            {showProTrial && (
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B6B70" }}>
                <span style={{ textDecoration: "line-through", color: "#4A4A52" }}>$4.99/week</span>
                {" → "}
                <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, color: "#22C55E" }}>$0.99 first week</span>
              </p>
            )}

            {billing === "yearly" && (
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B6B70" }}>
                $184.99/year —{" "}
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: 15, fontWeight: 800, color: "#22C55E" }}>Save 29%</span>
              </p>
            )}

            <div className="flex w-full flex-col" style={{ gap: 10 }}>
              {[
                billing === "yearly" ? "4,000 credits every month" : "1,000 credits every week",
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
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B6B70" }}>
                $549.99/year —{" "}
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: 15, fontWeight: 800, color: "#22C55E" }}>Save 29%</span>
              </p>
            )}

            <div className="flex w-full flex-col" style={{ gap: 10 }}>
              {[
                billing === "yearly" ? "17,500 credits every month" : "4,375 credits every week",
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
            {CREDIT_PACKS.map((pack) => {
              const isPopular = pack.id === "starter";
              return (
                <button
                  key={pack.id}
                  onClick={() => handleBuyPack(pack.id)}
                  disabled={packCheckout.isPending}
                  className="flex w-full items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    borderRadius: 16, padding: "14px 16px",
                    backgroundColor: "#16161A",
                    border: isPopular ? "1.5px solid #E8A83860" : "1.5px solid transparent",
                  }}
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
                    <div className="flex items-center" style={{ gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 400, color: "#6B6B70" }}>
                        {pack.credits.toLocaleString()} credits
                      </span>
                      {pack.savings && (
                        <span style={{ fontFamily: "Sora, sans-serif", fontSize: 12, fontWeight: 800, color: "#22C55E", backgroundColor: "#22C55E15", borderRadius: 6, padding: "2px 8px" }}>
                          -{pack.savings}%
                        </span>
                      )}
                    </div>
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
              );
            })}
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
