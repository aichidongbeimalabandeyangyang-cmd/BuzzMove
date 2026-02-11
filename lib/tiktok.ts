/* TikTok Pixel event helpers */

export const TIKTOK_PIXEL_ID = "D65DBORC77U5GADIKQA0";

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
      identify: (params?: Record<string, unknown>) => void;
    };
  }
}

function ttq(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.ttq?.track) {
    window.ttq.track(event, params);
  }
}

/** CompleteRegistration - User signs up */
export function trackTikTokSignUp(method: "google" | "email") {
  ttq("CompleteRegistration", { method });
}

/** InitiateCheckout - User starts checkout */
export function trackTikTokInitiateCheckout(params: {
  content_type: "product" | "subscription";
  content_name: string;
  value: number;
  currency: string;
}) {
  ttq("InitiateCheckout", params);
}

/** CompletePayment - User completes purchase */
export function trackTikTokPurchase(params: {
  content_type: "product" | "subscription";
  content_name: string;
  value: number;
  currency: string;
}) {
  ttq("CompletePayment", params);
}

/** SubmitForm - User generates video (custom conversion) */
export function trackTikTokVideoGenerate() {
  ttq("SubmitForm");
}

/** ViewContent - User views content (optional) */
export function trackTikTokViewContent(params?: { content_name?: string }) {
  ttq("ViewContent", params);
}

/** ClickButton - User clicks download button */
export function trackTikTokVideoDownload() {
  ttq("ClickButton", { button_name: "download_video" });
}

/** Share - User clicks share button */
export function trackTikTokShare() {
  ttq("Share", { content_type: "video" });
}
