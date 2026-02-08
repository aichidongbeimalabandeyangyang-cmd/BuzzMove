"use client";

import { useState } from "react";
import { PLANS, CREDIT_PACKS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const subscriptionCheckout =
    trpc.payment.createSubscriptionCheckout.useMutation({
      onSuccess(data) {
        if (data.url) window.location.href = data.url;
      },
    });

  const creditPackCheckout =
    trpc.payment.createCreditPackCheckout.useMutation({
      onSuccess(data) {
        if (data.url) window.location.href = data.url;
      },
    });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-10 sm:mb-14 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-5xl">
          Simple, <span className="text-gradient">flexible</span> pricing
        </h1>
        <p className="mx-auto max-w-md text-sm text-[var(--muted-foreground)] sm:text-base">
          Start free with 9,000 credits. Upgrade when you need more.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mb-8 sm:mb-12 flex items-center justify-center">
        <div className="inline-flex rounded-xl bg-[var(--secondary)] p-1 gap-1">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-[var(--primary)] text-[var(--background)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-2 ${
              billingPeriod === "yearly"
                ? "bg-[var(--primary)] text-[var(--background)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Yearly
            <span className="rounded-md bg-emerald-900 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Subscription plans */}
      <div className="mb-12 sm:mb-20 grid gap-4 sm:gap-5 md:grid-cols-3">
        {/* Free */}
        <div className="rounded-2xl bg-[var(--card)] p-6 sm:p-7">
          <div className="mb-5">
            <h3 className="text-lg font-bold">{PLANS.free.name}</h3>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">For trying things out</p>
          </div>
          <p className="mb-6">
            <span className="text-4xl font-bold tracking-tight">$0</span>
            <span className="ml-1 text-sm text-[var(--muted-foreground)]">/mo</span>
          </p>
          <ul className="mb-7 space-y-3 text-sm text-[var(--muted-foreground)]">
            {[
              "9,000 credits/month",
              "~1 video per day",
              "Standard quality (480p)",
              "Watermarked output",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full rounded-xl bg-[var(--secondary)] py-3.5 text-sm font-medium text-[var(--muted-foreground)] cursor-default"
          >
            Current Plan
          </button>
        </div>

        {/* Pro - Featured */}
        <div className="relative rounded-2xl border-2 border-[var(--primary-40)] bg-[var(--card)] p-6 pt-9 sm:p-7 sm:pt-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <span
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-[var(--background)] whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #e8a838, #f0c060)" }}
            >
              Most Popular
            </span>
          </div>
          <div className="mb-5">
            <h3 className="text-lg font-bold">{PLANS.pro.name}</h3>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">For regular creators</p>
          </div>
          <p className="mb-6">
            <span className="text-4xl font-bold tracking-tight">
              {billingPeriod === "yearly"
                ? formatPrice(PLANS.pro.price_yearly / 12)
                : formatPrice(PLANS.pro.price_monthly)}
            </span>
            <span className="ml-1 text-sm text-[var(--muted-foreground)]">/mo</span>
          </p>
          <ul className="mb-7 space-y-3 text-sm text-[var(--muted-foreground)]">
            {[
              "30,000 credits/month",
              "~120 videos per month",
              "1080p HD, no watermark",
              "5 concurrent generations",
              "Commercial license",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              subscriptionCheckout.mutate({ plan: "pro", billingPeriod })
            }
            disabled={subscriptionCheckout.isPending}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-[var(--background)] transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)" }}
          >
            Get Pro
          </button>
        </div>

        {/* Premium */}
        <div className="rounded-2xl bg-[var(--card)] p-6 sm:p-7">
          <div className="mb-5">
            <h3 className="text-lg font-bold">{PLANS.premium.name}</h3>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">For power users</p>
          </div>
          <p className="mb-6">
            <span className="text-4xl font-bold tracking-tight">
              {billingPeriod === "yearly"
                ? formatPrice(PLANS.premium.price_yearly / 12)
                : formatPrice(PLANS.premium.price_monthly)}
            </span>
            <span className="ml-1 text-sm text-[var(--muted-foreground)]">/mo</span>
          </p>
          <ul className="mb-7 space-y-3 text-sm text-[var(--muted-foreground)]">
            {[
              "100,000 credits/month",
              "~400 videos per month",
              "1080p HD, no watermark",
              "10 concurrent generations",
              "Commercial license",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              subscriptionCheckout.mutate({ plan: "premium", billingPeriod })
            }
            disabled={subscriptionCheckout.isPending}
            className="w-full rounded-xl bg-[var(--secondary)] py-3.5 text-sm font-medium transition-all active:scale-[0.98] hover:bg-[var(--primary-10)] hover:text-[var(--primary)] disabled:opacity-50"
          >
            Get Premium
          </button>
        </div>
      </div>

      {/* Creator Weekly */}
      <div className="mb-12 sm:mb-20 flex justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[var(--card)]">
          <div className="px-7 py-2.5 text-center" style={{ background: "linear-gradient(90deg, rgba(249,115,22,0.1), rgba(245,158,11,0.1))" }}>
            <span className="text-xs font-semibold text-orange-400">
              LIMITED OFFER &mdash; 50% OFF
            </span>
          </div>
          <div className="p-6 sm:p-7 text-center">
            <h3 className="mb-2 text-xl font-bold">Creator Weekly</h3>
            <p className="mb-4">
              <span className="text-4xl font-bold tracking-tight">$4.99</span>
              <span className="ml-2 text-lg text-[var(--muted-foreground)] line-through">$9.99</span>
              <span className="ml-1 text-sm text-[var(--muted-foreground)]">/week</span>
            </p>
            <p className="mb-6 text-sm text-[var(--muted-foreground)]">
              2,300 credits/week &middot; No watermark &middot; Commercial license
            </p>
            <button
              onClick={() =>
                subscriptionCheckout.mutate({ plan: "creator", billingPeriod: "weekly" })
              }
              disabled={subscriptionCheckout.isPending}
              className="rounded-xl px-10 py-3.5 text-sm font-semibold text-[var(--background)] transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)" }}
            >
              Start for $4.99/week
            </button>
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              Cancel anytime. No questions asked.
            </p>
          </div>
        </div>
      </div>

      {/* Credit Packs */}
      <div>
        <div className="mb-8 sm:mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">Credit Packs</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            One-time purchase. Credits never expire.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="rounded-2xl bg-[var(--card)] p-5 sm:p-6 text-center transition-all hover:ring-1 hover:ring-[var(--primary-30)]"
            >
              <h3 className="mb-1 text-base font-bold">{pack.name}</h3>
              <p className="mb-1 text-3xl font-bold tracking-tight">
                {formatPrice(pack.price)}
              </p>
              <p className="mb-5 text-xs text-[var(--muted-foreground)]">
                {pack.credits.toLocaleString()} credits
              </p>
              <button
                onClick={() => creditPackCheckout.mutate({ packId: pack.id })}
                disabled={creditPackCheckout.isPending}
                className="w-full rounded-xl bg-[var(--secondary)] py-3 text-sm font-medium transition-all active:scale-[0.98] hover:bg-[var(--primary-10)] hover:text-[var(--primary)] disabled:opacity-50"
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
