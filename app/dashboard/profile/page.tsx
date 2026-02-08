"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { createSupabaseBrowserClient } from "@/server/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile } = trpc.user.getProfile.useQuery();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const menuItems = [
    {
      icon: CrownIcon,
      label: "Pricing & Plans",
      href: "/pricing",
      description: "Manage your subscription",
    },
    {
      icon: GearIcon,
      label: "Settings",
      href: "/dashboard/settings",
      description: "Account preferences",
    },
    {
      icon: LifebuoyIcon,
      label: "Help & Support",
      href: "/support",
      description: "Get help with your account",
    },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-10">
      {/* User info section */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--secondary)]">
          <svg className="h-9 w-9 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          {profile?.email?.split("@")[0] || "User"}
        </h1>
        <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
          {profile?.email || "Loading..."}
        </p>
        <span className="mt-2 inline-flex items-center rounded-full bg-[var(--primary-10)] px-3 py-1 text-xs font-medium text-[var(--primary)] capitalize">
          {profile?.subscription_plan || "free"} plan
        </span>
      </div>

      {/* Menu items */}
      <div className="mb-4 overflow-hidden rounded-2xl bg-[var(--card)]">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--secondary)] ${
                i < menuItems.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)]">
                <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.description}</p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          );
        })}
      </div>

      {/* Log out */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-4 rounded-2xl bg-[var(--card)] px-5 py-4 transition-colors hover:bg-[var(--secondary)]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--destructive-10)]">
          <svg className="h-5 w-5 text-[var(--destructive)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </div>
        <span className="text-sm font-medium text-[var(--destructive)]">Log Out</span>
      </button>

      {/* Version */}
      <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        BuzzMove v1.0.0
      </p>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────── */

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LifebuoyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796l4.138-3.448M7.288 19.67l3.448-4.138m-3.448 4.138a9.027 9.027 0 01-1.306-1.652 9.027 9.027 0 01-1.652-1.306m2.958 2.958a9.014 9.014 0 010-9.424m4.138 5.976a3.736 3.736 0 01-.88 1.388 3.737 3.737 0 01-1.388.88m2.268-2.268a3.765 3.765 0 010-2.528m-2.268 4.796l-4.138 3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976l-4.138 3.448m0-12.872l4.138 3.448m-4.138-3.448A9.027 9.027 0 015.982 4.33a9.028 9.028 0 011.306-1.652m0 0a9.014 9.014 0 019.424 0M7.288 4.33l3.448 4.138" />
    </svg>
  );
}
