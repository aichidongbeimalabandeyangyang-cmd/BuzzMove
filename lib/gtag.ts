/* Google Analytics 4 + Google Ads event helpers */

export const GA_ID = "G-EBM4MV97XE";
export const ADS_ID = "AW-6484653792";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

// 1. Sign-up / Login
export function trackSignUp(method: "google" | "email") {
  gtag("event", "sign_up", { method });
}

// 2. Image uploaded
export function trackImageUpload() {
  gtag("event", "image_upload");
}

// 3. Video generation started
export function trackVideoGenerate(params: { mode: string; duration: string; credits: number }) {
  gtag("event", "video_generate", params);
}

// 4. Purchase completed (called on redirect back from Stripe)
export function trackPurchase(value: number) {
  gtag("event", "purchase", { currency: "USD", value });
}

// 5. Video download click
export function trackVideoDownload() {
  gtag("event", "video_download_click");
}

// 6. Share click
export function trackShareClick() {
  gtag("event", "click_share");
}

// 7. Login modal opened
export function trackLoginModalView() {
  gtag("event", "login_modal_view");
}

// 8. Paywall shown
export function trackPaywallView() {
  gtag("event", "paywall_view");
}

// 8. Click checkout button (before Stripe redirect)
export function trackClickCheckout(params: { type: "credit_pack" | "subscription"; plan: string }) {
  gtag("event", "click_checkout", params);
}
