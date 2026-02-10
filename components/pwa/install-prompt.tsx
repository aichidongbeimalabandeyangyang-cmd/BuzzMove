"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "vv_pwa_dismiss";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA install prompt. Shows a banner encouraging users to add BuzzMove to home screen.
 * Triggers after the user has generated at least 1 video (meaningful engagement).
 * On iOS (no beforeinstallprompt), shows manual instructions.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // Only show on mobile devices
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (!isMobile) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(ios);

    // Listen for browser's install prompt (Android/Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for custom event from video generation success
    const showHandler = () => setShow(true);
    window.addEventListener("show-install-prompt", showHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("show-install-prompt", showHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  if (isStandalone || !show) return null;

  // iOS: show manual instructions
  if (isIos) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-up sm:left-auto sm:right-4 sm:max-w-sm">
        <div
          className="relative flex flex-col gap-3 p-4"
          style={{ borderRadius: 16, backgroundColor: "#1A1A1F", border: "1px solid #252530" }}
        >
          <button onClick={handleDismiss} className="absolute right-3 top-3" aria-label="Dismiss">
            <X style={{ width: 18, height: 18, color: "#6B6B70" }} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="flex shrink-0 items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
            >
              <Download style={{ width: 20, height: 20, color: "#0B0B0E" }} strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#FAFAF9" }}>Add to Home Screen</p>
              <p style={{ fontSize: 13, color: "#6B6B70" }}>Get the full app experience</p>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#9A9AA0", lineHeight: 1.6 }}>
            Tap the <span style={{ color: "#FAFAF9" }}>Share</span> button
            <span style={{ marginInline: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAFAF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "-2px" }}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </span>
            then <span style={{ color: "#FAFAF9" }}>Add to Home Screen</span>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome: native install prompt
  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-up sm:left-auto sm:right-4 sm:max-w-sm">
      <div
        className="relative flex items-center gap-3 p-4"
        style={{ borderRadius: 16, backgroundColor: "#1A1A1F", border: "1px solid #252530" }}
      >
        <button onClick={handleDismiss} className="absolute right-3 top-3" aria-label="Dismiss">
          <X style={{ width: 18, height: 18, color: "#6B6B70" }} />
        </button>
        <div
          className="flex shrink-0 items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
        >
          <Download style={{ width: 20, height: 20, color: "#0B0B0E" }} strokeWidth={2.5} />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#FAFAF9" }}>Install BuzzMove</p>
            <p style={{ fontSize: 13, color: "#6B6B70" }}>Quick access from your home screen</p>
          </div>
          <button
            onClick={handleInstall}
            style={{
              height: 36, borderRadius: 10, paddingInline: 16,
              background: "linear-gradient(135deg, #F0C060, #E8A838)",
              fontSize: 14, fontWeight: 700, color: "#0B0B0E",
              alignSelf: "flex-start",
            }}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
