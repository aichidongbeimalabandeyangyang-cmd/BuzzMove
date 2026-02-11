/**
 * Facebook Conversions API (CAPI) - Server-side event tracking
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 * Endpoint: POST https://graph.facebook.com/v18.0/{pixel-id}/events
 */

const FB_PIXEL_ID = "1584375072654423";
const FB_API_VERSION = "v18.0";
const FB_API_ENDPOINT = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events`;

interface FacebookUserData {
  em?: string; // Email (will be auto-hashed by Facebook)
  ph?: string; // Phone (will be auto-hashed)
  external_id?: string; // User ID
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string; // Facebook click tracking cookie (_fbc)
  fbp?: string; // Facebook browser ID cookie (_fbp)
  fbclid?: string; // Facebook click ID from URL
}

interface FacebookCustomData {
  content_type?: string;
  content_name?: string;
  value?: number;
  currency?: string;
  content_ids?: string[];
  contents?: Array<{
    id?: string;
    quantity?: number;
    item_price?: number;
  }>;
  [key: string]: unknown;
}

interface FacebookEvent {
  event_name: string;
  event_time: number; // Unix timestamp in seconds
  event_id?: string; // For deduplication
  event_source_url?: string;
  action_source: "website";
  user_data: FacebookUserData;
  custom_data?: FacebookCustomData;
}

interface FacebookCAPIPayload {
  data: FacebookEvent[];
  test_event_code?: string; // Optional: for testing in Events Manager
}

/**
 * Send event to Facebook CAPI
 * Fire-and-forget: logs errors but doesn't throw
 */
async function sendFacebookCAPIEvent(event: FacebookEvent) {
  const accessToken = process.env.FB_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[Facebook CAPI] FB_ACCESS_TOKEN not configured, skipping");
    return;
  }

  const payload: FacebookCAPIPayload = {
    data: [event],
  };

  try {
    const url = `${FB_API_ENDPOINT}?access_token=${encodeURIComponent(accessToken)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[Facebook CAPI] HTTP ${response.status}:`,
        text.slice(0, 200)
      );
      return;
    }

    const result = await response.json();
    if (result.error) {
      console.error("[Facebook CAPI] API error:", result.error);
    } else {
      console.log("[Facebook CAPI] Event sent successfully:", event.event_name);
    }
  } catch (error: any) {
    console.error("[Facebook CAPI] Request failed:", error.message);
  }
}

/**
 * Create Facebook user_data object with proper attribution
 */
function createUserData(opts: {
  userId?: string;
  email?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
}): FacebookUserData {
  const userData: FacebookUserData = {};

  if (opts.email) userData.em = opts.email;
  if (opts.phone) userData.ph = opts.phone;
  if (opts.userId) userData.external_id = opts.userId;
  if (opts.ip) userData.client_ip_address = opts.ip;
  if (opts.userAgent) userData.client_user_agent = opts.userAgent;
  
  // Facebook attribution cookies (critical for attribution)
  if (opts.fbp) userData.fbp = opts.fbp;
  if (opts.fbc) userData.fbc = opts.fbc;
  
  // Facebook click ID from URL
  if (opts.fbclid && !opts.fbc) {
    // If we have fbclid but no _fbc cookie, construct _fbc format
    // Format: fb.{subdomain_index}.{creation_time}.{fbclid}
    const timestamp = Math.floor(Date.now() / 1000);
    userData.fbc = `fb.1.${timestamp}.${opts.fbclid}`;
  }

  return userData;
}

/**
 * Track CompleteRegistration event (sign up)
 */
export async function trackFacebookCAPISignUp(opts: {
  userId?: string;
  email?: string;
  method?: "google" | "email";
  userAgent?: string;
  ip?: string;
  url?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
}) {
  await sendFacebookCAPIEvent({
    event_name: "CompleteRegistration",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId || `signup_${opts.userId}_${Date.now()}`,
    event_source_url: opts.url,
    action_source: "website",
    user_data: createUserData({
      userId: opts.userId,
      email: opts.email,
      ip: opts.ip,
      userAgent: opts.userAgent,
      fbp: opts.fbp,
      fbc: opts.fbc,
      fbclid: opts.fbclid,
    }),
    custom_data: {
      method: opts.method,
    },
  });
}

/**
 * Track InitiateCheckout event
 */
export async function trackFacebookCAPIInitiateCheckout(opts: {
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
  fbp?: string;
  fbc?: string;
  fbclid?: string;
}) {
  await sendFacebookCAPIEvent({
    event_name: "InitiateCheckout",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId || `checkout_${opts.userId}_${Date.now()}`,
    event_source_url: opts.url,
    action_source: "website",
    user_data: createUserData({
      userId: opts.userId,
      email: opts.email,
      ip: opts.ip,
      userAgent: opts.userAgent,
      fbp: opts.fbp,
      fbc: opts.fbc,
      fbclid: opts.fbclid,
    }),
    custom_data: {
      content_type: opts.contentType,
      content_name: opts.contentName,
      value: opts.value,
      currency: opts.currency,
    },
  });
}

/**
 * Track Purchase event
 */
export async function trackFacebookCAPIPurchase(opts: {
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
  fbp?: string;
  fbc?: string;
  fbclid?: string;
}) {
  await sendFacebookCAPIEvent({
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId || opts.transactionId || `purchase_${opts.userId}_${Date.now()}`,
    event_source_url: opts.url,
    action_source: "website",
    user_data: createUserData({
      userId: opts.userId,
      email: opts.email,
      ip: opts.ip,
      userAgent: opts.userAgent,
      fbp: opts.fbp,
      fbc: opts.fbc,
      fbclid: opts.fbclid,
    }),
    custom_data: {
      content_type: opts.contentType,
      content_name: opts.contentName,
      value: opts.value,
      currency: opts.currency,
    },
  });
}

/**
 * Track Lead event (video generation)
 */
export async function trackFacebookCAPIVideoGenerate(opts: {
  userId?: string;
  email?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
  metadata?: Record<string, unknown>;
}) {
  await sendFacebookCAPIEvent({
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId || `video_${opts.userId}_${Date.now()}`,
    event_source_url: opts.url,
    action_source: "website",
    user_data: createUserData({
      userId: opts.userId,
      email: opts.email,
      ip: opts.ip,
      userAgent: opts.userAgent,
      fbp: opts.fbp,
      fbc: opts.fbc,
    }),
    custom_data: opts.metadata,
  });
}
