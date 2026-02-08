"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { Play, Mail } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
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
      {/* Modal: cornerRadius 24, fill #0B0B0E, gap 24, padding [24,24,40,24] */}
      <div
        className="flex w-full flex-col items-center"
        style={{ maxWidth: 390, margin: "0 24px", gap: 24, borderRadius: 24, backgroundColor: "#0B0B0E", padding: "24px 24px 40px 24px" }}
      >
        {/* Handle bar: 40x4, cornerRadius 100, fill #3A3A40 */}
        <div style={{ width: 40, height: 4, borderRadius: 100, backgroundColor: "#3A3A40" }} />

        {/* Logo Section: gap 12, center */}
        <div className="flex w-full flex-col items-center" style={{ gap: 12 }}>
          {/* Logo Icon: 48x48, cornerRadius 12, gradient */}
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

        {/* Google Button: h52, cornerRadius 14, fill #FFFFFF, gap 10 */}
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center"
          style={{ height: 52, borderRadius: 14, backgroundColor: "#FFFFFF", gap: 10 }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: "#4285F4" }}>G</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#0B0B0E" }}>Continue with Google</span>
        </button>

        {/* Divider: gap 16, line + "or" + line */}
        <div className="flex w-full items-center" style={{ gap: 16 }}>
          <div className="flex-1" style={{ height: 1, backgroundColor: "#252530" }} />
          <span style={{ fontSize: 13, color: "#6B6B70" }}>or</span>
          <div className="flex-1" style={{ height: 1, backgroundColor: "#252530" }} />
        </div>

        {/* Email Button: h52, cornerRadius 14, stroke 1.5px #252530, gap 10 */}
        <button
          className="flex w-full items-center justify-center"
          style={{ height: 52, borderRadius: 14, border: "1.5px solid #252530", gap: 10 }}
        >
          <Mail style={{ width: 20, height: 20, color: "#FAFAF9" }} strokeWidth={1.5} />
          <span style={{ fontSize: 16, fontWeight: 600, color: "#FAFAF9" }}>Continue with Email</span>
        </button>

        {/* Terms: 12/400 #4A4A50, center, lineHeight 1.5 */}
        <p style={{ fontSize: 12, fontWeight: 400, color: "#4A4A50", textAlign: "center", lineHeight: 1.5 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
