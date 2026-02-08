"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import { LoginModal } from "@/components/auth/login-modal";
import { BottomNav } from "./bottom-nav";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const { data: creditData } = trpc.credit.getBalance.useQuery(undefined, { enabled: !!user });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") setShowLogin(true);
  }, []);

  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  // Determine header style based on route
  const isHome = pathname === "/";
  const isGenerator = false; // Generator is inline in the page
  const isAssets = pathname === "/dashboard" || pathname === "/dashboard/";
  const isProfile = pathname === "/dashboard/profile";
  const isSettings = pathname === "/dashboard/settings";
  const isPricing = pathname === "/pricing";

  // Pages with back arrow
  const hasBackArrow = isSettings || isPricing;
  // Pages that show "BuzzMove" text as title
  const showBuzzMoveLogo = isHome || isProfile;
  // Pages with credit badge
  const showCredits = isAssets && user;

  const backHref = isSettings ? "/dashboard/profile" : isPricing ? "/dashboard/profile" : "/";

  // Title for back-arrow pages
  const pageTitle = isSettings ? "Settings" : isPricing ? "Pricing & Plans" : isAssets ? "Assets" : "";

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0B0B0E]">
        <div className="mx-auto flex h-14 max-w-[390px] items-center justify-between px-5">
          {/* Left side */}
          {hasBackArrow ? (
            <button onClick={() => router.back()} className="flex items-center gap-2">
              <svg className="h-[22px] w-[22px] text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span className="text-[17px] font-bold text-[var(--foreground)]">{pageTitle}</span>
            </button>
          ) : showBuzzMoveLogo ? (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, #E8A838, #F0C060)" }}>
                <svg className="h-3.5 w-3.5" fill="#0B0B0E" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span className="text-[17px] font-bold text-[var(--foreground)]">BuzzMove</span>
            </Link>
          ) : (
            <span className="text-xl font-bold text-[var(--foreground)]">{pageTitle}</span>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {showCredits && creditData && (
              <div className="flex items-center gap-1.5 rounded-full bg-[#16161A] px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                <span className="text-[13px] font-semibold text-[var(--foreground)]">{formatCredits(creditData.balance)}</span>
              </div>
            )}
            {/* Avatar */}
            {user ? (
              <Link href="/dashboard/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1E22]">
                <svg className="h-[18px] w-[18px] text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            ) : (
              <button onClick={() => setShowLogin(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1E22]">
                <svg className="h-[18px] w-[18px] text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tab separator line */}

      {/* Mobile bottom navigation */}
      <BottomNav isLoggedIn={!!user} onLoginClick={() => setShowLogin(true)} />

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
