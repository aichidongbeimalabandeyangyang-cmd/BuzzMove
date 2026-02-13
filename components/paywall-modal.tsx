"use client";

import { useEffect, useRef } from "react";
import { X, Zap, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CREDIT_PACKS, PLANS } from "@/lib/constants";
import { trackPaywallView, trackClickCheckout } from "@/lib/gtag";
import { trackTikTokInitiateCheckout } from "@/lib/tiktok";
import { trackFacebookInitiateCheckout } from "@/lib/facebook";
import { getGoogleAdsIds } from "@/lib/google-ads-ids";
import { getTikTokAdsIds } from "@/lib/tiktok-ads-ids";
import { getFacebookAdsIds } from "@/lib/facebook-ads-ids";
import { getDeviceKey } from "@/components/tracking/device-key-ensurer";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  context?: "download" | "credits" | "concurrent";
  /** Current user plan — used to hide already-purchased tiers in concurrent context */
  userPlan?: string;
}

export function PaywallModal({ open, onClose, context = "credits", userPlan }: PaywallModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const creditData = trpc.credit.getBalance.useQuery();
  const hasPurchased = creditData.data?.hasPurchased ?? false;

  const packCheckout = trpc.payment.createCreditPackCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });
  const subCheckout = trpc.payment.createSubscriptionCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });

  useEffect(() => {
    if (!open) return;
    trackPaywallView();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const isPending = packCheckout.isPending || subCheckout.isPending;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="flex w-full flex-col sm:max-w-[420px] sm:!rounded-3xl"
        style={{
          backgroundColor: "#0B0B0E",
          borderRadius: "24px 24px 0 0",
          padding: "16px 20px 32px 20px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Zap style={{ width: 20, height: 20, color: "#E8A838" }} strokeWidth={1.5} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF9" }}>
              {context === "concurrent" ? "Generate in Parallel" : context === "download" ? "Unlock Downloads" : "Get More Credits"}
            </span>
          </div>
          <button onClick={onClose} className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 100, backgroundColor: "#16161A" }}>
            <X style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          </button>
        </div>

        <p style={{ fontSize: 14, fontWeight: 400, color: "#6B6B70", marginBottom: 20 }}>
          {context === "concurrent"
            ? userPlan === "pro"
              ? "You've hit the Pro plan limit. Upgrade to Premium for up to 10 parallel generations."
              : "You're already generating a video. Subscribe to generate multiple videos at once."
            : context === "download"
              ? "Subscribe or purchase credits to download your videos."
              : "Subscribe or purchase credits to keep generating."}
        </p>

        {/* ---- SUBSCRIPTIONS (priority) ---- */}
        <div className="flex flex-col" style={{ gap: 8, marginBottom: context === "concurrent" ? 0 : 20 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "#6B6B70" }}>SUBSCRIPTIONS</span>

          {/* Pro — hide if user is already Pro in concurrent context */}
          {!(context === "concurrent" && userPlan === "pro") && <button
            onClick={() => {
              const price = (!hasPurchased ? PLANS.pro.trial_price_weekly : PLANS.pro.price_weekly) / 100;
              trackClickCheckout({ type: "subscription", plan: "pro" });
              trackTikTokInitiateCheckout({
                content_type: "subscription",
                content_name: "BuzzMove Pro Plan (weekly)",
                value: price,
                currency: "USD",
              });
              trackFacebookInitiateCheckout({
                content_type: "subscription",
                content_name: "BuzzMove Pro Plan (weekly)",
                value: price,
                currency: "USD",
              });
              const gads = getGoogleAdsIds();
              const tads = getTikTokAdsIds();
              const fads = getFacebookAdsIds();
              subCheckout.mutate({
                plan: "pro", billingPeriod: "weekly", withTrial: !hasPurchased,
                gclid: gads.gclid, gbraid: gads.gbraid, wbraid: gads.wbraid,
                ttclid: tads.ttclid,
                fbclid: fads.fbclid, fbp: fads.fbp, fbc: fads.fbc,
                deviceKey: getDeviceKey() || undefined,
              });
            }}
            disabled={isPending}
            className="flex w-full flex-col transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "12px 14px", gap: 8, border: !hasPurchased ? "1.5px solid #E8A83860" : "1.5px solid transparent" }}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center" style={{ gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Pro</span>
                {!hasPurchased && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", backgroundColor: "#22C55E20", borderRadius: 6, padding: "2px 6px" }}>
                    $0.99 FIRST WEEK
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                {!hasPurchased ? (
                  <>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#E8A838" }}>$0.99/wk</span>
                    <span style={{ fontSize: 11, fontWeight: 400, color: "#6B6B70" }}>then $4.99/wk</span>
                  </>
                ) : (
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#FAFAF9" }}>$4.99/wk</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap" style={{ gap: 4 }}>
              {["No watermark", "HD download", "3x parallel", "Commercial use"].map((b) => (
                <span key={b} style={{ fontSize: 11, fontWeight: 500, color: context === "concurrent" && b === "3x parallel" ? "#E8A838" : "#6B6B70", backgroundColor: context === "concurrent" && b === "3x parallel" ? "#E8A83820" : "#ffffff08", borderRadius: 6, padding: "2px 8px" }}>
                  {b}
                </span>
              ))}
            </div>
          </button>}

          {/* Premium */}
          <button
            onClick={() => {
              const price = PLANS.premium.price_weekly / 100;
              trackClickCheckout({ type: "subscription", plan: "premium" });
              trackTikTokInitiateCheckout({
                content_type: "subscription",
                content_name: "BuzzMove Premium Plan (weekly)",
                value: price,
                currency: "USD",
              });
              trackFacebookInitiateCheckout({
                content_type: "subscription",
                content_name: "BuzzMove Premium Plan (weekly)",
                value: price,
                currency: "USD",
              });
              const gads = getGoogleAdsIds();
              const tads = getTikTokAdsIds();
              const fads = getFacebookAdsIds();
              subCheckout.mutate({
                plan: "premium", billingPeriod: "weekly",
                gclid: gads.gclid, gbraid: gads.gbraid, wbraid: gads.wbraid,
                ttclid: tads.ttclid,
                fbclid: fads.fbclid, fbp: fads.fbp, fbc: fads.fbc,
                deviceKey: getDeviceKey() || undefined,
              });
            }}
            disabled={isPending}
            className="flex w-full flex-col transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "12px 14px", gap: 8 }}
          >
            <div className="flex w-full items-center justify-between">
              <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Premium</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#FAFAF9" }}>$14.99/wk</span>
            </div>
            <div className="flex flex-wrap" style={{ gap: 4 }}>
              {["No watermark", "HD download", "10x parallel", "Commercial use", "30% cheaper credits"].map((b) => (
                <span key={b} style={{ fontSize: 11, fontWeight: 500, color: context === "concurrent" && b === "10x parallel" ? "#E8A838" : "#6B6B70", backgroundColor: context === "concurrent" && b === "10x parallel" ? "#E8A83820" : "#ffffff08", borderRadius: 6, padding: "2px 8px" }}>
                  {b}
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* ---- CREDIT PACKS (hidden for concurrent context) ---- */}
        {context !== "concurrent" && <div className="flex flex-col" style={{ gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "#6B6B70" }}>ONE-TIME PACKS</span>
          {CREDIT_PACKS.map((pack) => {
            const isPopular = pack.id === "starter";
            return (
              <button
                key={pack.id}
                onClick={() => {
                  const price = pack.price / 100;
                  trackClickCheckout({ type: "credit_pack", plan: pack.id });
                  trackTikTokInitiateCheckout({
                    content_type: "product",
                    content_name: `${pack.name} (${pack.credits} credits)`,
                    value: price,
                    currency: "USD",
                  });
                  trackFacebookInitiateCheckout({
                    content_type: "product",
                    content_name: `${pack.name} (${pack.credits} credits)`,
                    value: price,
                    currency: "USD",
                  });
                  const gads = getGoogleAdsIds();
                  const tads = getTikTokAdsIds();
                  const fads = getFacebookAdsIds();
                  packCheckout.mutate({
                    packId: pack.id as any,
                    gclid: gads.gclid, gbraid: gads.gbraid, wbraid: gads.wbraid,
                    ttclid: tads.ttclid,
                    fbclid: fads.fbclid, fbp: fads.fbp, fbc: fads.fbc,
                    deviceKey: getDeviceKey() || undefined,
                  });
                }}
                disabled={isPending}
                className="flex w-full items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  borderRadius: 14,
                  backgroundColor: "#16161A",
                  padding: "12px 14px",
                  border: isPopular ? "1.5px solid #E8A83860" : "1.5px solid transparent",
                }}
              >
                <div className="flex flex-col" style={{ gap: 2 }}>
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
                <span style={{ fontSize: 16, fontWeight: 700, color: "#E8A838" }}>
                  ${(pack.price / 100).toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>}
      </div>
    </div>
  );
}
