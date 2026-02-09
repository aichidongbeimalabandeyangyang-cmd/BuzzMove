"use client";

import { useEffect, useRef } from "react";
import { X, Zap, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CREDIT_PACKS } from "@/lib/constants";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const packCheckout = trpc.payment.createCreditPackCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });
  const subCheckout = trpc.payment.createSubscriptionCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });

  useEffect(() => {
    if (!open) return;
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
            <span style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF9" }}>Unlock Downloads</span>
          </div>
          <button onClick={onClose} className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 100, backgroundColor: "#16161A" }}>
            <X style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          </button>
        </div>

        <p style={{ fontSize: 14, fontWeight: 400, color: "#6B6B70", marginBottom: 20 }}>
          Purchase credits or subscribe to download your videos.
        </p>

        {/* ---- CREDIT PACKS (priority) ---- */}
        <div className="flex flex-col" style={{ gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "#6B6B70" }}>ONE-TIME PACKS</span>
          {CREDIT_PACKS.map((pack, i) => (
            <button
              key={pack.id}
              onClick={() => packCheckout.mutate({ packId: pack.id as any })}
              disabled={isPending}
              className="flex w-full items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                borderRadius: 14,
                backgroundColor: "#16161A",
                padding: "12px 14px",
                border: i === 0 ? "1.5px solid #E8A83860" : "1.5px solid transparent",
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
                <span style={{ fontSize: 12, fontWeight: 400, color: "#6B6B70" }}>
                  {pack.credits.toLocaleString()} credits{pack.savings ? ` · Save ${pack.savings}%` : ""}
                </span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#E8A838" }}>
                ${(pack.price / 100).toFixed(2)}
              </span>
            </button>
          ))}
        </div>

        {/* ---- SUBSCRIPTIONS ---- */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "#6B6B70" }}>SUBSCRIPTIONS</span>

          {/* Pro */}
          <button
            onClick={() => subCheckout.mutate({ plan: "pro", billingPeriod: "yearly" })}
            disabled={isPending}
            className="flex w-full flex-col transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "12px 14px", gap: 8 }}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center" style={{ gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Pro</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", backgroundColor: "#22C55E20", borderRadius: 6, padding: "2px 6px" }}>
                  -20% YEARLY
                </span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#FAFAF9" }}>$15.99/mo</span>
            </div>
            <div className="flex flex-wrap" style={{ gap: 4 }}>
              {["No watermark", "HD download", "3x parallel", "Commercial use"].map((b) => (
                <span key={b} style={{ fontSize: 11, fontWeight: 500, color: "#6B6B70", backgroundColor: "#ffffff08", borderRadius: 6, padding: "2px 8px" }}>
                  {b}
                </span>
              ))}
            </div>
          </button>

          {/* Premium */}
          <button
            onClick={() => subCheckout.mutate({ plan: "premium", billingPeriod: "yearly" })}
            disabled={isPending}
            className="flex w-full flex-col transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "12px 14px", gap: 8 }}
          >
            <div className="flex w-full items-center justify-between">
              <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Premium</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#FAFAF9" }}>$69.99/mo</span>
            </div>
            <div className="flex flex-wrap" style={{ gap: 4 }}>
              {["No watermark", "HD download", "10x parallel", "Commercial use", "30% cheaper credits"].map((b) => (
                <span key={b} style={{ fontSize: 11, fontWeight: 500, color: "#6B6B70", backgroundColor: "#ffffff08", borderRadius: 6, padding: "2px 8px" }}>
                  {b}
                </span>
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
