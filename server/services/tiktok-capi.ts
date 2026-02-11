/**
 * TikTok Conversions API (CAPI) - Server-side event tracking
 * Docs: https://ads.tiktok.com/marketing_api/docs?id=1739584855420929
 * Endpoint: POST https://business-api.tiktok.com/open_api/v1.3/pixel/track/
 */

const TIKTOK_PIXEL_ID = "D65DBORC77U5GADIKQA0";
const TIKTOK_API_ENDPOINT =
  "https://business-api.tiktok.com/open_api/v1.3/pixel/track/";

interface TikTokEventContext {
  user?: {
    external_id?: string; // User ID (hashed SHA256)
    email?: string; // Will be auto-hashed by TikTok
    phone_number?: string; // Will be auto-hashed by TikTok
    ttclid?: string; // TikTok Click ID for attribution
  };
  page?: {
    url?: string;
    referrer?: string;
  };
  user_agent?: string;
  ip?: string;
}

interface TikTokEventProperties {
  content_type?: string;
  content_name?: string;
  value?: number;
  currency?: string;
  contents?: Array<{
    content_id?: string;
    content_name?: string;
    quantity?: number;
    price?: number;
  }>;
  [key: string]: unknown;
}

interface TikTokEventPayload {
  pixel_code: string;
  event: string;
  event_id?: string;
  timestamp?: string;
  context?: {
    user?: {
      external_id?: string;
      email?: string;
      phone_number?: string;
      ttclid?: string; // TikTok Click ID
    };
    page?: {
      url?: string;
      referrer?: string;
    };
    user_agent?: string;
    ip?: string;
  };
  properties?: TikTokEventProperties;
}

/**
 * Send event to TikTok CAPI
 * Fire-and-forget: logs errors but doesn't throw
 */
async function sendTikTokCAPIEvent(payload: TikTokEventPayload) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[TikTok CAPI] TIKTOK_ACCESS_TOKEN not configured, skipping");
    return;
  }

  try {
    const response = await fetch(TIKTOK_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[TikTok CAPI] HTTP ${response.status}:`,
        text.slice(0, 200)
      );
      return;
    }

    const result = await response.json();
    if (result.code !== 0) {
      console.error("[TikTok CAPI] API error:", result.message || result);
    }
  } catch (error: any) {
    console.error("[TikTok CAPI] Request failed:", error.message);
  }
}

/**
 * Track CompleteRegistration event (sign up)
 */
export async function trackTikTokCAPISignUp(opts: {
  userId?: string;
  email?: string;
  method?: "google" | "email";
  userAgent?: string;
  ip?: string;
  url?: string;
  eventId?: string;
  ttclid?: string;
}) {
  await sendTikTokCAPIEvent({
    pixel_code: TIKTOK_PIXEL_ID,
    event: "CompleteRegistration",
    event_id: opts.eventId || `signup_${opts.userId}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    context: {
      user: {
        external_id: opts.userId,
        email: opts.email,
        ttclid: opts.ttclid,
      },
      user_agent: opts.userAgent,
      ip: opts.ip,
      page: {
        url: opts.url,
      },
    },
    properties: {
      method: opts.method,
    },
  });
}

/**
 * Track InitiateCheckout event
 */
export async function trackTikTokCAPIInitiateCheckout(opts: {
  userId?: string;
  email?: string;
  contentType: "product" | "subscription";
  contentName: string;
  value: number;
  currency: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  eventId?: string;
  ttclid?: string;
}) {
  await sendTikTokCAPIEvent({
    pixel_code: TIKTOK_PIXEL_ID,
    event: "InitiateCheckout",
    event_id: opts.eventId || `checkout_${opts.userId}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    context: {
      user: {
        external_id: opts.userId,
        email: opts.email,
        ttclid: opts.ttclid,
      },
      user_agent: opts.userAgent,
      ip: opts.ip,
      page: {
        url: opts.url,
      },
    },
    properties: {
      content_type: opts.contentType,
      content_name: opts.contentName,
      value: opts.value,
      currency: opts.currency,
    },
  });
}

/**
 * Track CompletePayment event (purchase)
 */
export async function trackTikTokCAPIPurchase(opts: {
  userId?: string;
  email?: string;
  contentType: "product" | "subscription";
  contentName: string;
  value: number;
  currency: string;
  transactionId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  eventId?: string;
  ttclid?: string;
}) {
  await sendTikTokCAPIEvent({
    pixel_code: TIKTOK_PIXEL_ID,
    event: "CompletePayment",
    event_id: opts.eventId || opts.transactionId || `purchase_${opts.userId}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    context: {
      user: {
        external_id: opts.userId,
        email: opts.email,
        ttclid: opts.ttclid,
      },
      user_agent: opts.userAgent,
      ip: opts.ip,
      page: {
        url: opts.url,
      },
    },
    properties: {
      content_type: opts.contentType,
      content_name: opts.contentName,
      value: opts.value,
      currency: opts.currency,
    },
  });
}

/**
 * Track SubmitForm event (video generation)
 */
export async function trackTikTokCAPIVideoGenerate(opts: {
  userId?: string;
  email?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
}) {
  await sendTikTokCAPIEvent({
    pixel_code: TIKTOK_PIXEL_ID,
    event: "SubmitForm",
    event_id: opts.eventId || `video_${opts.userId}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    context: {
      user: {
        external_id: opts.userId,
        email: opts.email,
      },
      user_agent: opts.userAgent,
      ip: opts.ip,
      page: {
        url: opts.url,
      },
    },
    properties: opts.metadata,
  });
}
