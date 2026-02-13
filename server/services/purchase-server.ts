/**
 * purchase_server - Unified backend purchase conversion event
 * Sends to: Google (GA4 MP), TikTok CAPI, Facebook CAPI, Adjust S2S
 * All events include: email, event_id, attribution params (gclid, gbraid, wbraid, ttclid, fbclid, fbp)
 */

const GA4_MP_URL = "https://www.google-analytics.com/mp/collect";
const TIKTOK_API = "https://business-api.tiktok.com/open_api/v1.3/pixel/track/";
const FB_API_VERSION = "v18.0";
const ADJUST_S2S_URL = "https://s2s.adjust.com/event";

const TIKTOK_PIXEL_ID = "D65DBORC77U5GADIKQA0";
const FB_PIXEL_ID = "1584375072654423";
const ADJUST_APP_TOKEN = "18txd8zubjb4";
const ADJUST_PURCHASE_TOKEN = "rvidtp";

export interface PurchaseServerParams {
  eventId: string;
  email: string;
  userId: string;
  contentType: "product" | "subscription";
  contentName: string;
  value: number;
  currency: string;
  transactionId: string;
  attribution: {
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
    ttclid?: string;
    fbclid?: string;
    fbp?: string;
  };
  deviceKey?: string;
}

/**
 * Send purchase_server to all channels (fire-and-forget)
 */
export async function trackPurchaseServer(params: PurchaseServerParams): Promise<void> {
  const { eventId, email, userId, contentType, contentName, value, currency, transactionId, attribution, deviceKey } = params;

  await Promise.allSettled([
    sendGA4PurchaseServer(params),
    sendTikTokPurchaseServer(params),
    sendFacebookPurchaseServer(params),
    sendAdjustPurchaseServer(params),
  ]);
}

async function sendGA4PurchaseServer(params: PurchaseServerParams): Promise<void> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_MEASUREMENT_API_SECRET;
  if (!measurementId || !apiSecret) {
    return;
  }

  try {
    const url = `${GA4_MP_URL}?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    const body = {
      user_id: params.userId,
      events: [
        {
          name: "purchase",
          params: {
            transaction_id: params.transactionId,
            value: params.value,
            currency: params.currency,
            event_id: params.eventId,
            items: [
              {
                item_id: params.contentName,
                item_name: params.contentName,
                item_category: params.contentType,
                price: params.value,
                quantity: 1,
              },
            ],
            ...(params.attribution.gclid && { gclid: params.attribution.gclid }),
            ...(params.attribution.gbraid && { gbraid: params.attribution.gbraid }),
            ...(params.attribution.wbraid && { wbraid: params.attribution.wbraid }),
          },
        },
      ],
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[purchase_server] GA4 MP error:", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[purchase_server] GA4 error:", e instanceof Error ? e.message : e);
  }
}

async function sendTikTokPurchaseServer(params: PurchaseServerParams): Promise<void> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) return;

  try {
    const payload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event: "CompletePayment",
      event_id: params.eventId,
      timestamp: new Date().toISOString(),
      context: {
        user: {
          external_id: params.userId,
          email: params.email,
          ttclid: params.attribution.ttclid,
        },
      },
      properties: {
        content_type: params.contentType,
        content_name: params.contentName,
        value: params.value,
        currency: params.currency,
      },
    };

    const res = await fetch(TIKTOK_API, {
      method: "POST",
      headers: {
        "Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[purchase_server] TikTok error:", res.status);
    }
  } catch (e) {
    console.error("[purchase_server] TikTok error:", e instanceof Error ? e.message : e);
  }
}

async function sendFacebookPurchaseServer(params: PurchaseServerParams): Promise<void> {
  const token = process.env.FB_ACCESS_TOKEN;
  if (!token) return;

  try {
    const userData: Record<string, string> = {
      em: params.email,
      external_id: params.userId,
    };
    if (params.attribution.fbp) userData.fbp = params.attribution.fbp;
    if (params.attribution.fbclid) {
      userData.fbc = `fb.1.${Math.floor(Date.now() / 1000)}.${params.attribution.fbclid}`;
    }

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: params.eventId,
          action_source: "website" as const,
          user_data: userData,
          custom_data: {
            content_type: params.contentType,
            content_name: params.contentName,
            value: params.value,
            currency: params.currency,
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[purchase_server] Facebook error:", res.status);
    }
  } catch (e) {
    console.error("[purchase_server] Facebook error:", e instanceof Error ? e.message : e);
  }
}

async function sendAdjustPurchaseServer(params: PurchaseServerParams): Promise<void> {
  const appToken = process.env.NEXT_PUBLIC_ADJUST_APP_TOKEN || ADJUST_APP_TOKEN;
  if (!appToken) return;

  // Adjust S2S requires a device ID. For web, use device_key as android_id (lowercase, no hyphens)
  const deviceId = params.deviceKey
    ? params.deviceKey.replace(/-/g, "").toLowerCase()
    : `web_${params.userId.replace(/-/g, "").toLowerCase()}`;

  const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  const environment = process.env.NEXT_PUBLIC_ADJUST_ENV || (isDev ? "sandbox" : "production");

  try {
    const searchParams = new URLSearchParams({
      s2s: "1",
      app_token: appToken,
      event_token: ADJUST_PURCHASE_TOKEN,
      android_id: deviceId,
      created_at_unix: String(Math.floor(Date.now() / 1000)),
      revenue: String(params.value),
      currency: params.currency,
      environment,
    });

    const res = await fetch(`${ADJUST_S2S_URL}?${searchParams.toString()}`, {
      method: "POST",
    });

    if (!res.ok) {
      console.error("[purchase_server] Adjust S2S error:", res.status);
    }
  } catch (e) {
    console.error("[purchase_server] Adjust error:", e instanceof Error ? e.message : e);
  }
}
