/* Facebook Pixel event helpers */

export const FB_PIXEL_ID = "1584375072654423";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

/** CompleteRegistration - User signs up (first login, new user) */
export function trackFacebookSignUp(method: "google" | "email") {
  fbq("track", "CompleteRegistration", { method });
}

/** Login - Returning user logs in */
export function trackFacebookLogin(method: "google" | "email") {
  fbq("trackCustom", "Login", { method });
}

/** InitiateCheckout - User starts checkout */
export function trackFacebookInitiateCheckout(params: {
  content_type: "product" | "subscription";
  content_name: string;
  value: number;
  currency: string;
}) {
  fbq("track", "InitiateCheckout", {
    content_type: params.content_type,
    content_name: params.content_name,
    value: params.value,
    currency: params.currency,
  });
}

/** Purchase - User completes purchase */
export function trackFacebookPurchase(params: {
  content_type: "product" | "subscription";
  content_name: string;
  value: number;
  currency: string;
  eventId?: string;
}) {
  const { eventId, ...rest } = params;
  const options = eventId ? { eventID: eventId } : undefined;
  fbq("track", "Purchase", {
    content_type: rest.content_type,
    content_name: rest.content_name,
    value: rest.value,
    currency: rest.currency,
  }, options);
}

/** Lead - User generates video (custom conversion) */
export function trackFacebookVideoGenerate() {
  fbq("track", "Lead");
}

/** ViewContent - User views content (optional) */
export function trackFacebookViewContent(params?: { content_name?: string }) {
  fbq("track", "ViewContent", params);
}

/** Contact - User clicks download button (custom event) */
export function trackFacebookVideoDownload() {
  fbq("trackCustom", "VideoDownload");
}

/** Share - User clicks share button (custom event) */
export function trackFacebookShare() {
  fbq("trackCustom", "VideoShare");
}
