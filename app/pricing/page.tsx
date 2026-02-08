"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

  const subscriptionCheckout = trpc.payment.createSubscriptionCheckout.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });

  const proPrice = billingPeriod === "yearly"
    ? formatPrice(PLANS.pro.price_yearly / 12)
    : formatPrice(PLANS.pro.price_monthly);

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Title section */}
      <div className="flex flex-col items-center gap-3 px-5 py-4">
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.8px] text-[var(--foreground)] text-center">
          Unleash your full creativity
        </h1>
        <p className="text-[15px] text-[#6B6B70] text-center">
          Choose the plan that fits your workflow.
        </p>

        {/* Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-[#16161A] p-1">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`flex items-center justify-center rounded-[10px] px-5 py-2 text-sm transition-all ${
              billingPeriod === "monthly"
                ? "bg-[var(--primary)] font-semibold text-[#0B0B0E]"
                : "font-medium text-[#6B6B70]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`flex items-center justify-center gap-1.5 rounded-[10px] px-5 py-2 text-sm transition-all ${
              billingPeriod === "yearly"
                ? "bg-[var(--primary)] font-semibold text-[#0B0B0E]"
                : "font-medium text-[#6B6B70]"
            }`}
          >
            Yearly
            <span className="rounded-lg bg-[#22C55E] px-2 py-0.5 text-[11px] font-semibold text-white">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Pro card with gradient border */}
      <div className="flex-1 px-5">
        <div
          className="overflow-hidden rounded-[20px] p-[1.5px]"
          style={{ background: "linear-gradient(135deg, #F0C060, rgba(232,168,56,0.3))" }}
        >
          <div className="flex flex-col gap-3.5 rounded-[19px] bg-[#16161A] p-5">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-[var(--foreground)]">Professional</h3>
              <span className="w-fit rounded-md bg-[#22C55E20] px-2.5 py-1 text-[11px] font-semibold text-[#22C55E]">
                MOST POPULAR
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight text-[var(--foreground)]">{proPrice}</span>
              <span className="text-sm text-[#6B6B70]">/month</span>
            </div>

            {billingPeriod === "yearly" && (
              <p className="text-[17px] font-bold text-[var(--primary)]">
                Save $87/year — was {formatPrice(PLANS.pro.price_monthly * 12)}
              </p>
            )}

            {/* Features */}
            <div className="flex flex-col gap-2.5">
              {[
                "30,000 credits / month",
                "No waiting — priority processing",
                "No watermark · Commercial license",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-[var(--foreground)]">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => subscriptionCheckout.mutate({ plan: "pro", billingPeriod })}
              disabled={subscriptionCheckout.isPending}
              className="flex h-12 w-full items-center justify-center rounded-[14px] text-base font-bold text-[#0B0B0E] transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #F0C060, #E8A838)",
                boxShadow: "0 4px 20px rgba(232,168,56,0.25)",
              }}
            >
              Upgrade to Pro
            </button>

            {/* Urgency + cancel */}
            <p className="text-center text-sm font-semibold text-[var(--foreground)]">
              ⏰  Offer ends Feb 28
            </p>
            <p className="text-center text-xs text-[#6B6B70]">
              Cancel anytime. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
