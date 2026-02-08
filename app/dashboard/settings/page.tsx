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

  const accountItems = [
    {
      icon: UserEditIcon,
      label: "Edit Profile",
      description: profile?.email || "Manage your account details",
      href: "#",
    },
    {
      icon: BellIcon,
      label: "Notifications",
      description: "Email and push preferences",
      href: "#",
    },
    {
      icon: ShieldIcon,
      label: "Privacy & Security",
      description: "Password and privacy settings",
      href: "#",
    },
  ];

  const legalItems = [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund-policy" },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/dashboard/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
            aria-label="Back to profile"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="ml-12 text-sm text-[var(--muted-foreground)]">
          Manage your account and preferences
        </p>
      </div>

      {/* ACCOUNT section */}
      <div className="mb-6">
        <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Account
        </h2>
        <div className="overflow-hidden rounded-2xl bg-[var(--card)]">
          {accountItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--secondary)] ${
                  i < accountItems.length - 1 ? "border-b border-[var(--border)]" : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)]">
                  <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{item.description}</p>
                </div>
                <svg className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Billing shortcut */}
      {profile?.stripe_customer_id && (
        <div className="mb-6">
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Billing
          </h2>
          <div className="rounded-2xl bg-[var(--card)] p-5">
            <button
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
              className="w-full rounded-xl bg-[var(--secondary)] px-5 py-3.5 text-sm font-medium transition-all active:scale-[0.98] hover:bg-[var(--primary-10)] hover:text-[var(--primary)] disabled:opacity-50"
            >
              {portalMutation.isPending ? "Loading..." : "Manage Subscription"}
            </button>
          </div>
        </div>
      )}

      {/* LEGAL section */}
      <div className="mb-8">
        <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Legal
        </h2>
        <div className="overflow-hidden rounded-2xl bg-[var(--card)]">
          {legalItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-[var(--secondary)] ${
                i < legalItems.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <span className="text-[var(--foreground)]">{item.label}</span>
              <svg className="h-4 w-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-[var(--muted-foreground)]">
        BuzzMove v1.0.0
      </p>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────── */

function UserEditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
