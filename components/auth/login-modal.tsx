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
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
    >
      {/* Login Sheet: cornerRadius [24,24,0,0] → centered modal uses full rounded-3xl
          fill: #0B0B0E, gap: 24, padding: [24,24,40,24] */}
      <div className="mx-6 flex w-full max-w-[390px] flex-col items-center gap-6 rounded-3xl bg-[#0B0B0E] px-6 pt-6 pb-10">
        {/* Handle bar: 40x4, cornerRadius 100, fill #3A3A40 */}
        <div className="h-1 w-10 rounded-full bg-[#3A3A40]" />

        {/* Logo Section: gap 12, center */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Logo Icon: 48x48, cornerRadius 12, gradient */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
          >
            <Play className="h-6 w-6 text-[#0B0B0E]" fill="#0B0B0E" strokeWidth={0} />
          </div>
          {/* Title: 24/700 #FAFAF9, center */}
          <h2 className="text-2xl font-bold text-[#FAFAF9] text-center">Welcome to BuzzMove</h2>
          {/* Subtitle: 15/400 #6B6B70, center */}
          <p className="text-[15px] text-[#6B6B70] text-center">
            Turn any photo into a stunning video with AI
          </p>
        </div>

        {/* Google Button: h52, cornerRadius 14, fill #FFFFFF, gap 10 */}
        <button
          onClick={handleGoogleLogin}
          className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-white"
        >
          <span className="text-xl font-bold text-[#4285F4]">G</span>
          <span className="text-base font-semibold text-[#0B0B0E]">Continue with Google</span>
        </button>

        {/* Apple Button: h52, cornerRadius 14, stroke 1.5px #252530, gap 10 */}
        <button
          className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px]"
          style={{ border: "1.5px solid #252530" }}
        >
          <svg className="h-5 w-5 text-[#FAFAF9]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span className="text-base font-semibold text-[#FAFAF9]">Continue with Apple</span>
        </button>

        {/* Divider Row: gap 16, line + "or" + line */}
        <div className="flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-[#252530]" />
          <span className="text-[13px] text-[#6B6B70]">or</span>
          <div className="h-px flex-1 bg-[#252530]" />
        </div>

        {/* Email Button: h52, cornerRadius 14, stroke 1.5px #252530, gap 10 */}
        <button
          className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px]"
          style={{ border: "1.5px solid #252530" }}
        >
          <Mail className="h-5 w-5 text-[#FAFAF9]" strokeWidth={1.5} />
          <span className="text-base font-semibold text-[#FAFAF9]">Continue with Email</span>
        </button>

        {/* Terms: 12/400 #4A4A50, center, lineHeight 1.5 */}
        <p className="text-xs text-[#4A4A50] text-center leading-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
