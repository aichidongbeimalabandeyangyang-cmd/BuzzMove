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

// 1. Sign-up - 第一次登陆成功（新用户）
export function trackSignUp(method: "google" | "email") {
  gtag("event", "sign_up", { method });
}

// 2. Login - 老用户登陆成功
export function trackLogin(method: "google" | "email") {
  gtag("event", "login", { method });
}

// 3. Image uploaded
export function trackImageUpload() {
  gtag("event", "image_upload");
}

// 4. Video generation started
export function trackVideoGenerate(params: { mode: string; duration: string; credits: number }) {
  gtag("event", "video_generate", params);
}

// 5. Purchase completed (called on redirect back from Stripe)
export function trackPurchase(params: {
  value: number;
  transactionId?: string;
  itemId: string;
  itemName: string;
  itemCategory: "subscription" | "credit_pack";
}) {
  const transactionId = params.transactionId || `txn_${Date.now()}`;
  gtag("event", "purchase", {
    currency: "USD",
    value: params.value,
    transaction_id: transactionId,
    event_id: transactionId, // for deduplication with backend
    items: [
      {
        item_id: params.itemId,
        item_name: params.itemName,
        item_category: params.itemCategory,
        price: params.value,
        quantity: 1,
      },
    ],
  });
}

// 6. Video download click
export function trackVideoDownload() {
  gtag("event", "video_download_click");
}

// 7. Share click
export function trackShareClick() {
  gtag("event", "click_share");
}

// 8. Login modal opened
export function trackLoginModalView() {
  gtag("event", "login_modal_view");
}

// 9. Paywall shown
export function trackPaywallView() {
  gtag("event", "paywall_view");
}

// 10. Click checkout button (before Stripe redirect)
export function trackClickCheckout(params: { type: "credit_pack" | "subscription"; plan: string }) {
  gtag("event", "click_checkout", params);
}
