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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">Account Settings</h1>

      {/* Profile info */}
      <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-bold">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Email</span>
            <span>{profile?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Plan</span>
            <span className="capitalize">{profile?.subscription_plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Credits</span>
            <span>{profile?.credits_balance?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-bold">Billing</h2>
        {profile?.stripe_customer_id ? (
          <button
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
            className="rounded-lg bg-[var(--secondary)] px-4 py-2 text-sm font-medium hover:bg-[var(--border)] transition-colors"
          >
            Manage Subscription
          </button>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No active subscription.{" "}
            <a href="/pricing" className="text-[var(--primary)] underline">
              View plans
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
