"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import { LoginModal } from "@/components/auth/login-modal";
import { BottomNav } from "./bottom-nav";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const { data: creditData } = trpc.credit.getBalance.useQuery(undefined, {
    enabled: !!user,
  });

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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for custom open-login event from other components
  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled ? "glass border-[var(--border)]" : "bg-[var(--background)] border-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="BuzzMove home">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{ background: "linear-gradient(135deg, #e8a838, #f0c060)" }}
            >
              <svg className="h-3.5 w-3.5" fill="#050505" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">BuzzMove</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                {/* Credit badge */}
                <div className="ml-1 sm:ml-3 mr-1 sm:mr-2 flex items-center gap-1.5 rounded-full bg-[var(--secondary)] px-3 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  <span className="text-xs font-medium tabular-nums">{formatCredits(creditData?.balance ?? 0)}</span>
                </div>
                {/* Desktop nav links */}
                <Link href="/dashboard" className="hidden sm:block px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] rounded-lg">
                  Assets
                </Link>
                <Link href="/pricing" className="hidden sm:block px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] rounded-lg">
                  Pricing
                </Link>
                {/* Avatar */}
                <Link
                  href="/dashboard/profile"
                  className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--secondary)] transition-colors hover:bg-[var(--primary-10)]"
                  aria-label="My Profile"
                >
                  <svg className="h-[18px] w-[18px] text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--secondary)] transition-colors hover:bg-[var(--primary-10)]"
                aria-label="Sign in"
              >
                <svg className="h-[18px] w-[18px] text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <BottomNav isLoggedIn={!!user} onLoginClick={() => setShowLogin(true)} />

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
