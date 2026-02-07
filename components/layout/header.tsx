"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import { LoginModal } from "@/components/auth/login-modal";

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "glass border-[var(--border)]"
            : "bg-[var(--background)] border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
            >
              <svg className="h-4 w-4" fill="var(--background)" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Buzz<span className="text-gradient">Move</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            <Link
              href="/explorer"
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
            >
              Pricing
            </Link>

            {user ? (
              <>
                <div className="ml-2 flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--secondary)] px-3 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  <span className="text-xs font-medium tabular-nums">
                    {formatCredits(creditData?.balance ?? 0)}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="ml-3 rounded-lg px-5 py-2 text-sm font-semibold text-[var(--background)] transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, var(--primary), #d4942e)" }}
              >
                Get Started
              </button>
            )}
          </nav>
        </div>
      </header>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
