"use client";

import { trpc } from "@/lib/trpc";

export default function SettingsPage() {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const portalMutation = trpc.payment.createPortalSession.useMutation({
    onSuccess(data) {
      if (data.url) window.location.href = data.url;
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-10 animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Manage your account and subscription
        </p>
      </div>

      {/* Profile info */}
      <div
        className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 animate-fade-up delay-100"
        style={{ boxShadow: "var(--card-shadow)" }}
      >
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
      <div
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 animate-fade-up delay-200"
        style={{ boxShadow: "var(--card-shadow)" }}
      >
        <h2 className="mb-5 text-base font-bold">Billing</h2>
        {profile?.stripe_customer_id ? (
          <button
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
            className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-5 py-3 text-sm font-medium transition-all hover:border-[var(--primary-40)] hover:bg-[var(--primary-10)] hover:text-[var(--primary)] disabled:opacity-50"
          >
            {portalMutation.isPending ? "Loading..." : "Manage Subscription"}
          </button>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No active subscription.{" "}
            <a
              href="/pricing"
              className="font-medium text-[var(--primary)] transition-colors hover:text-[var(--accent)]"
            >
              View plans
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
