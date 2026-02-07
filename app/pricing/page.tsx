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
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold">Simple, Flexible Pricing</h1>
        <p className="text-[var(--muted-foreground)]">
          Start free. Scale as you create.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <button
          onClick={() => setBillingPeriod("monthly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            billingPeriod === "monthly"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod("yearly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            billingPeriod === "yearly"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Yearly
          <span className="ml-1.5 rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
            Save 20%+
          </span>
        </button>
      </div>

      {/* Subscription plans */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {/* Free */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="mb-1 text-lg font-bold">{PLANS.free.name}</h3>
          <p className="mb-4 text-3xl font-bold">$0</p>
          <ul className="mb-6 space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>9,000 credits/month (~1 video/day)</li>
            <li>Standard quality (480p)</li>
            <li>Watermarked videos</li>
            <li>Standard license</li>
          </ul>
          <button
            disabled
            className="w-full rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium opacity-50"
          >
            Current Plan
          </button>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border-2 border-[var(--primary)] bg-[var(--card)] p-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--primary)] px-3 py-0.5 text-xs font-medium text-white">
            Most Popular
          </div>
          <h3 className="mb-1 text-lg font-bold">{PLANS.pro.name}</h3>
          <p className="mb-4 text-3xl font-bold">
            {billingPeriod === "yearly"
              ? formatPrice(PLANS.pro.price_yearly / 12)
              : formatPrice(PLANS.pro.price_monthly)}
            <span className="text-base font-normal text-[var(--muted-foreground)]">
              /mo
            </span>
          </p>
          <ul className="mb-6 space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>30,000 credits/month (~120 videos)</li>
            <li>Priority processing queue</li>
            <li>Up to 5 concurrent generations</li>
            <li>No watermark, 1080p HD</li>
            <li>Commercial license</li>
          </ul>
          <button
            onClick={() =>
              subscriptionCheckout.mutate({
                plan: "pro",
                billingPeriod,
              })
            }
            disabled={subscriptionCheckout.isPending}
            className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent)] transition-colors"
          >
            Get Pro
          </button>
        </div>

        {/* Premium */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="mb-1 text-lg font-bold">{PLANS.premium.name}</h3>
          <p className="mb-4 text-3xl font-bold">
            {billingPeriod === "yearly"
              ? formatPrice(PLANS.premium.price_yearly / 12)
              : formatPrice(PLANS.premium.price_monthly)}
            <span className="text-base font-normal text-[var(--muted-foreground)]">
              /mo
            </span>
          </p>
          <ul className="mb-6 space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>100,000 credits/month (~400 videos)</li>
            <li>Top priority processing</li>
            <li>Up to 10 concurrent generations</li>
            <li>No watermark, 1080p HD</li>
            <li>Commercial license</li>
          </ul>
          <button
            onClick={() =>
              subscriptionCheckout.mutate({
                plan: "premium",
                billingPeriod,
              })
            }
            disabled={subscriptionCheckout.isPending}
            className="w-full rounded-lg bg-[var(--secondary)] py-2.5 text-sm font-medium hover:bg-[var(--border)] transition-colors"
          >
            Get Premium
          </button>
        </div>
      </div>

      {/* Creator Weekly Plan */}
      <div className="mb-16 mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <div className="mb-2 inline-block rounded-full bg-orange-500/20 px-3 py-0.5 text-xs font-medium text-orange-400">
          50% OFF
        </div>
        <h3 className="mb-1 text-lg font-bold">Creator Weekly</h3>
        <p className="mb-2 text-3xl font-bold">
          $4.99
          <span className="ml-2 text-base font-normal text-[var(--muted-foreground)] line-through">
            $9.99
          </span>
          <span className="text-base font-normal text-[var(--muted-foreground)]">
            /week
          </span>
        </p>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          2,300 credits/week &middot; No watermark &middot; Commercial license
        </p>
        <button
          onClick={() =>
            subscriptionCheckout.mutate({
              plan: "creator",
              billingPeriod: "weekly",
            })
          }
          disabled={subscriptionCheckout.isPending}
          className="rounded-lg bg-[var(--primary)] px-8 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent)] transition-colors"
        >
          Start for $4.99
        </button>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Cancel anytime. No questions asked.
        </p>
      </div>

      {/* Credit Packs */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">Credit Packs</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          One-time purchase. Credits never expire.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {CREDIT_PACKS.map((pack) => (
          <div
            key={pack.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-center"
          >
            <h3 className="mb-1 font-bold">{pack.name}</h3>
            <p className="mb-1 text-2xl font-bold">
              {formatPrice(pack.price)}
            </p>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">
              {pack.credits.toLocaleString()} credits &middot; $
              {((pack.price / pack.credits) * 1000 / 100).toFixed(2)}/1K
            </p>
            <button
              onClick={() => creditPackCheckout.mutate({ packId: pack.id })}
              disabled={creditPackCheckout.isPending}
              className="w-full rounded-lg border border-[var(--border)] py-2 text-sm font-medium hover:bg-[var(--secondary)] transition-colors"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
