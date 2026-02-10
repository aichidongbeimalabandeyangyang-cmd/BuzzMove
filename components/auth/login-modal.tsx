"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { Play, Mail, ArrowLeft } from "lucide-react";
import { trackSignUp, trackLoginModalView } from "@/lib/gtag";
import { logEvent } from "@/lib/events";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string | null;
}

export function LoginModal({ open, onClose, redirectTo }: LoginModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"main" | "email" | "otp">("main");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    trackLoginModalView();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep("main");
      setEmail("");
      setOtp("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    // trackSignUp fires in auth callback, not here (user may cancel OAuth)
    const supabase = createSupabaseBrowserClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirectTo) callbackUrl.searchParams.set("redirectTo", redirectTo);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  };

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) throw error;
      logEvent("otp_send_ok", { email: email.trim() });
      setStep("otp");
    } catch (err: any) {
      logEvent("otp_send_fail", { email: email.trim(), error: err.message });
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });
      if (error) throw error;
      logEvent("otp_verify_ok", { email: email.trim() });
      trackSignUp("email");
      onClose();
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (err: any) {
      logEvent("otp_verify_fail", { email: email.trim(), error: err.message });
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="flex w-full flex-col items-center"
        style={{ maxWidth: 390, margin: "0 24px", gap: 24, borderRadius: 24, backgroundColor: "#0B0B0E", padding: "24px 24px 40px 24px" }}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 100, backgroundColor: "#3A3A40" }} />

        {/* ---- MAIN STEP ---- */}
        {step === "main" && (
          <>
            {/* Logo Section */}
            <div className="flex w-full flex-col items-center" style={{ gap: 12 }}>
              <div
                className="flex items-center justify-center"
                style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
              >
                <Play style={{ width: 24, height: 24, color: "#0B0B0E" }} fill="#0B0B0E" strokeWidth={0} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#FAFAF9", textAlign: "center" }}>Welcome to BuzzMove</h2>
              <p style={{ fontSize: 15, fontWeight: 400, color: "#6B6B70", textAlign: "center" }}>
                Turn any photo into a stunning video with AI
              </p>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center"
              style={{ height: 52, borderRadius: 14, backgroundColor: "#FFFFFF", gap: 10 }}
            >
              <span style={{ fontSize: 20, fontWeight: 700, color: "#4285F4" }}>G</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#0B0B0E" }}>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex w-full items-center" style={{ gap: 16 }}>
              <div className="flex-1" style={{ height: 1, backgroundColor: "#252530" }} />
              <span style={{ fontSize: 13, color: "#6B6B70" }}>or</span>
              <div className="flex-1" style={{ height: 1, backgroundColor: "#252530" }} />
            </div>

            {/* Email Button */}
            <button
              onClick={() => setStep("email")}
              className="flex w-full items-center justify-center"
              style={{ height: 52, borderRadius: 14, border: "1.5px solid #252530", gap: 10 }}
            >
              <Mail style={{ width: 20, height: 20, color: "#FAFAF9" }} strokeWidth={1.5} />
              <span style={{ fontSize: 16, fontWeight: 600, color: "#FAFAF9" }}>Continue with Email</span>
            </button>

            {/* Terms */}
            <p style={{ fontSize: 12, fontWeight: 400, color: "#4A4A50", textAlign: "center", lineHeight: 1.5 }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </>
        )}

        {/* ---- EMAIL STEP ---- */}
        {step === "email" && (
          <>
            <button
              onClick={() => { setStep("main"); setError(null); }}
              className="flex w-full items-center"
              style={{ gap: 6 }}
            >
              <ArrowLeft style={{ width: 18, height: 18, color: "#6B6B70" }} strokeWidth={1.5} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#6B6B70" }}>Back</span>
            </button>

            <div className="flex w-full flex-col items-center" style={{ gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#FAFAF9" }}>Enter your email</h2>
              <p style={{ fontSize: 14, fontWeight: 400, color: "#6B6B70", textAlign: "center" }}>
                We'll send a verification code to your inbox
              </p>
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendOtp(); }}
              placeholder="you@example.com"
              autoFocus
              className="w-full bg-transparent outline-none"
              style={{
                height: 52, borderRadius: 14, border: "1.5px solid #252530",
                padding: "0 16px", fontSize: 15, color: "#FAFAF9",
              }}
            />

            {error && (
              <p style={{ fontSize: 13, color: "#EF4444", textAlign: "center" }}>{error}</p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ height: 52, borderRadius: 14, background: "linear-gradient(135deg, #F0C060, #E8A838)" }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0B0B0E" }}>
                {loading ? "Sending..." : "Send Code"}
              </span>
            </button>
          </>
        )}

        {/* ---- OTP STEP ---- */}
        {step === "otp" && (
          <>
            <button
              onClick={() => { setStep("email"); setOtp(""); setError(null); }}
              className="flex w-full items-center"
              style={{ gap: 6 }}
            >
              <ArrowLeft style={{ width: 18, height: 18, color: "#6B6B70" }} strokeWidth={1.5} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#6B6B70" }}>Back</span>
            </button>

            <div className="flex w-full flex-col items-center" style={{ gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#FAFAF9" }}>Check your email</h2>
              <p style={{ fontSize: 14, fontWeight: 400, color: "#6B6B70", textAlign: "center" }}>
                Enter the code sent to <span style={{ color: "#FAFAF9" }}>{email}</span>
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onKeyDown={(e) => { if (e.key === "Enter") handleVerifyOtp(); }}
              placeholder="00000000"
              autoFocus
              className="w-full bg-transparent outline-none text-center"
              style={{
                height: 52, borderRadius: 14, border: "1.5px solid #252530",
                padding: "0 16px", fontSize: 24, fontWeight: 700, color: "#FAFAF9",
                letterSpacing: 6,
              }}
            />

            {error && (
              <p style={{ fontSize: 13, color: "#EF4444", textAlign: "center" }}>{error}</p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 8}
              className="flex w-full items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ height: 52, borderRadius: 14, background: "linear-gradient(135deg, #F0C060, #E8A838)" }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0B0B0E" }}>
                {loading ? "Verifying..." : "Verify & Sign In"}
              </span>
            </button>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="flex w-full items-center justify-center disabled:opacity-50"
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6B6B70" }}>Didn't receive it? Resend code</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
