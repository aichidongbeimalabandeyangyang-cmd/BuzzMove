"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/server/supabase/client";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap and restore focus on close
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the dialog after animation
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-[380px] mx-4 animate-scale-in rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 outline-none"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(232,168,56,0.06)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-7">
          <div
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #e8a838, #f0c060)", boxShadow: "0 2px 12px rgba(232,168,56,0.25)" }}
          >
            <svg className="h-5 w-5" fill="#050505" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h2 id="login-modal-title" className="text-xl font-bold tracking-tight">Welcome to BuzzMove</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Sign in to create AI-powered videos
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl bg-[var(--primary-10)] border border-[var(--primary-20)] p-5 text-center">
            <svg className="mx-auto mb-3 h-8 w-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <p className="text-sm font-medium">Check your email</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              We sent a sign-in link to {email}
            </p>
          </div>
        ) : (
          <>
            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-gray-800 transition-all hover:bg-gray-50 active:scale-[0.98]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--card)] px-3 text-xs text-[var(--muted-foreground)]">
                  or
                </span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailLogin}>
              <label htmlFor="login-email" className="sr-only">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                required
                className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm transition-all placeholder:text-[var(--muted-foreground)]"
              />
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-[var(--background)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)", boxShadow: "0 1px 8px rgba(232,168,56,0.2)" }}
              >
                {loading ? "Sending..." : "Continue with Email"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
