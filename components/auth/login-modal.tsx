"use client";

import { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => dialogRef.current?.focus());
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      setSent(true);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-[390px] animate-scale-in bg-[#0B0B0E] outline-none"
        style={{ borderRadius: "24px 24px 0 0", padding: "24px 24px 40px 24px" }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Grab handle */}
          <div className="h-1 w-10 rounded-full bg-[#3A3A40]" />

          {/* Logo + title */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
            >
              <svg className="h-6 w-6" fill="#0B0B0E" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h2 id="login-modal-title" className="text-2xl font-bold text-[var(--foreground)] text-center">
              Welcome to BuzzMove
            </h2>
            <p className="text-[15px] text-[#6B6B70] text-center">
              Turn any photo into a stunning video with AI
            </p>
          </div>

          {sent ? (
            <div className="w-full rounded-xl bg-[var(--primary-10)] border border-[var(--primary-20)] p-5 text-center">
              <svg className="mx-auto mb-3 h-8 w-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <p className="text-sm font-medium">Check your email</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">We sent a sign-in link to {email}</p>
            </div>
          ) : (
            <>
              {/* Google button */}
              <button
                onClick={handleGoogleLogin}
                className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-white text-base font-semibold text-[#0B0B0E] transition-all active:scale-[0.98]"
              >
                <span className="text-xl font-bold text-[#4285F4]">G</span>
                Continue with Google
              </button>

              {/* Apple button */}
              <button
                className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-white text-base font-semibold text-[#0B0B0E] transition-all active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="#0B0B0E" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </button>

              {/* Divider */}
              <div className="flex w-full items-center gap-4">
                <div className="h-px flex-1 bg-[#252530]" />
                <span className="text-[13px] text-[#6B6B70]">or</span>
                <div className="h-px flex-1 bg-[#252530]" />
              </div>

              {/* Email button */}
              <form onSubmit={handleEmailLogin} className="w-full">
                <button
                  type="button"
                  onClick={() => {
                    // For simplicity, show email input on click
                    const input = document.getElementById("login-email-input");
                    if (input) { input.style.display = "block"; input.focus(); }
                    else handleEmailLogin({ preventDefault: () => {} } as any);
                  }}
                  className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] text-base font-semibold text-[var(--foreground)] transition-all active:scale-[0.98]"
                  style={{ border: "1.5px solid #252530" }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Continue with Email
                </button>
                {/* Hidden email input that shows on demand */}
                <div id="login-email-input" style={{ display: "none" }} className="mt-3 space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    required
                    className="w-full rounded-[14px] border border-[#252530] bg-[#16161A] px-4 py-3.5 text-sm text-[var(--foreground)] placeholder:text-[#6B6B70] outline-none focus:border-[var(--primary)]"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-[52px] w-full items-center justify-center rounded-[14px] text-base font-semibold text-[#0B0B0E] transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #F0C060, #E8A838)" }}
                  >
                    {loading ? "Sending..." : "Send Magic Link"}
                  </button>
                </div>
              </form>

              {/* Terms */}
              <p className="text-center text-xs leading-[1.5] text-[#4A4A50]">
                By continuing, you agree to our{" "}
                <a href="/terms" className="underline">Terms of Service</a> and{" "}
                <a href="/privacy" className="underline">Privacy Policy</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
