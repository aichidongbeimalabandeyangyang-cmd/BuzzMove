"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function SettingsPage() {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const portalMutation = trpc.payment.createPortalSession.useMutation({
    onSuccess(data) {
      if (data.url) window.location.href = data.url;
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
          Manage your account and subscription
        </p>
      </div>

      {/* Profile info */}
      <div className="mb-4 sm:mb-6 rounded-2xl bg-[var(--card)] p-5 sm:p-7">
        <h2 className="mb-5 text-base font-bold">Profile</h2>
        <div className="space-y-4">
          {[
            { label: "Email", value: profile?.email },
            { label: "Plan", value: profile?.subscription_plan, capitalize: true },
            {
              label: "Credits",
              value: profile?.credits_balance?.toLocaleString(),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between border-b border-[var(--border)] pb-4 last:border-0 last:pb-0"
            >
              <span className="text-sm text-[var(--muted-foreground)]">
                {item.label}
              </span>
              <span
                className={`text-sm font-medium ${
                  item.capitalize ? "capitalize" : ""
                }`}
              >
                {item.value ?? "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing */}
      <div className="mb-4 sm:mb-6 rounded-2xl bg-[var(--card)] p-5 sm:p-7">
        <h2 className="mb-5 text-base font-bold">Billing</h2>
        {profile?.stripe_customer_id ? (
          <button
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
            className="rounded-xl bg-[var(--secondary)] px-5 py-3.5 text-sm font-medium transition-all active:scale-[0.98] hover:bg-[var(--primary-10)] hover:text-[var(--primary)] disabled:opacity-50"
          >
            {portalMutation.isPending ? "Loading..." : "Manage Subscription"}
          </button>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No active subscription.{" "}
            <Link
              href="/pricing"
              className="font-medium text-[var(--primary)] transition-colors hover:text-[var(--accent)]"
            >
              View plans
            </Link>
          </p>
        )}
      </div>

      {/* Quick links */}
      <div className="rounded-2xl bg-[var(--card)] p-5 sm:p-7">
        <h2 className="mb-5 text-base font-bold">Help & Legal</h2>
        <div className="space-y-1">
          {[
            { href: "/support", label: "Support" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/refund-policy", label: "Refund Policy" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
            >
              {link.label}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
