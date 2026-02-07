"use client";

import { useState } from "react";
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl mx-4">
        <h2 className="mb-1 text-xl font-bold">Welcome to VibeVideo</h2>
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          Sign in to generate AI videos
        </p>

        {sent ? (
          <div className="rounded-lg bg-[var(--secondary)] p-4 text-center text-sm">
            Check your email for a sign-in link!
          </div>
        ) : (
          <>
            <button
              onClick={handleGoogleLogin}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[var(--card)] px-2 text-[var(--muted-foreground)]">
                  or
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mb-3 w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--accent)] disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : "Continue with Email"}
              </button>
            </form>
          </>
        )}

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
