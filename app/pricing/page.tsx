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
      {/* Title section — design: gap 12, padding [16,20,24,20] */}
      <div className="flex flex-col items-center gap-3 px-5 pt-4 pb-6">
        {/* Heading — design: 28px 700, letterSpacing -0.8 */}
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.8px] text-[var(--foreground)] text-center">
          Unleash your full creativity
        </h1>
        {/* Sub — design: 15px normal #6B6B70 */}
        <p className="text-[15px] text-[#6B6B70] text-center">
          Choose the plan that fits your workflow.
        </p>

        {/* Toggle — design: cornerRadius 12, fill #16161A, gap 4, padding 4 */}
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
            {/* Badge — design: fontSize 13, fontWeight 800, padding [2,8], cornerRadius 8 */}
            <span className="rounded-lg bg-[#22C55E] px-2 py-[2px] text-[13px] font-extrabold text-white">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Pro card with gradient border — design: cornerRadius 20, gradient 1.5px */}
      <div className="flex-1 px-5">
        <div
          className="overflow-hidden rounded-[20px] p-[1.5px]"
          style={{ background: "linear-gradient(135deg, #F0C060, rgba(232,168,56,0.3))" }}
        >
          {/* Inner card — design: cornerRadius 19, fill #16161A, padding 20, gap 14 */}
          <div className="flex flex-col gap-3.5 rounded-[19px] bg-[#16161A] p-5">
            {/* Header */}
            <div className="flex flex-col gap-2">
              {/* Title — design: 22px 700 */}
              <h3 className="text-[22px] font-bold text-[var(--foreground)]">Professional</h3>
              <span className="w-fit rounded-md bg-[#E8A83830] px-2.5 py-[3px] text-[11px] font-semibold text-[var(--primary)]">
                MOST POPULAR
              </span>
            </div>

            {/* Price — design: amount 46px 700 letterSpacing -1.5, per 17px normal #6B6B70, gap 4 */}
            <div className="flex items-baseline gap-1">
              <span className="text-[46px] font-bold tracking-[-1.5px] text-[var(--foreground)]">{proPrice}</span>
              <span className="text-[17px] text-[#6B6B70]">/month</span>
            </div>

            {/* Save — design: 17px 700 #E8A838 */}
            {billingPeriod === "yearly" && (
              <p className="text-[17px] font-bold text-[var(--primary)]">
                Save $87/year — was {formatPrice(PLANS.pro.price_monthly * 12)}
              </p>
            )}

            {/* Features — design: gap 10, icon 16px check #E8A838, text 14px 500, gap 10 between icon+text */}
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
                  <span className="text-sm font-medium text-[var(--foreground)]">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA — design: h 48, cornerRadius 14, text 16px 700 */}
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

            {/* Urgency — design: 14px 600 */}
            <p className="text-center text-sm font-semibold text-[var(--foreground)]">
              ⏰  Offer ends Feb 28
            </p>
            {/* Cancel — design: 12px normal #6B6B70 */}
            <p className="text-center text-xs text-[#6B6B70]">
              Cancel anytime. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
