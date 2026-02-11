/* Adjust SDK event helpers - BuzzMove App Token: 18txd8zubjb4 */

export const ADJUST_APP_TOKEN = "18txd8zubjb4";

export const ADJUST_EVENTS = {
  first_visit: "fymzu0",
  sign_up: "i9kkh2",
  login: "fv90zc",
  purchase: "rvidtp",
  video_generate: "ho91tg",
} as const;

declare global {
  interface Window {
    Adjust?: {
      initSdk: (config: {
        appToken: string;
        environment: "sandbox" | "production";
        logLevel?: string;
      }) => void;
      trackEvent: (params: {
        eventToken: string;
        revenue?: number;
        currency?: string;
        deduplicationId?: string;
      }) => void | Promise<void>;
    };
  }
}

function adjustTrack(params: {
  eventToken: string;
  revenue?: number;
  currency?: string;
  deduplicationId?: string;
}) {
  if (typeof window !== "undefined" && window.Adjust?.trackEvent) {
    window.Adjust.trackEvent(params);
  }
}

/** First visit - fired once per device (handled in AdjustInit) */
export function trackAdjustFirstVisit() {
  adjustTrack({ eventToken: ADJUST_EVENTS.first_visit });
}

export function trackAdjustSignUp() {
  adjustTrack({ eventToken: ADJUST_EVENTS.sign_up });
}

export function trackAdjustLogin() {
  adjustTrack({ eventToken: ADJUST_EVENTS.login });
}

export function trackAdjustPurchase(value: number, transactionId?: string) {
  adjustTrack({
    eventToken: ADJUST_EVENTS.purchase,
    revenue: value,
    currency: "USD",
    deduplicationId: transactionId,
  });
}

export function trackAdjustVideoGenerate() {
  adjustTrack({ eventToken: ADJUST_EVENTS.video_generate });
}
