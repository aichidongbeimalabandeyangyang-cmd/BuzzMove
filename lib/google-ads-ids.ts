/**
 * Google Ads click IDs: gclid, gbraid, wbraid
 * Capture on landing, persist in cookie, pass to GA/Google Ads for conversion attribution.
 * See: https://support.google.com/google-ads/answer/9888656
 */

const COOKIE_NAME = "buzzmove_google_ads";
const MAX_AGE_DAYS = 30;

export interface GoogleAdsIds {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeDays: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeDays * 24 * 60 * 60}; SameSite=Lax`;
}

/** Store gclid, gbraid, wbraid. Call when URL has these params. */
export function storeGoogleAdsIds(ids: GoogleAdsIds): void {
  const filtered: GoogleAdsIds = {};
  if (ids.gclid?.trim()) filtered.gclid = ids.gclid.trim();
  if (ids.gbraid?.trim()) filtered.gbraid = ids.gbraid.trim();
  if (ids.wbraid?.trim()) filtered.wbraid = ids.wbraid.trim();
  if (Object.keys(filtered).length === 0) return;
  setCookie(COOKIE_NAME, JSON.stringify(filtered), MAX_AGE_DAYS);
}

/** Read stored Google Ads click IDs. Use when firing conversion events. */
export function getGoogleAdsIds(): GoogleAdsIds {
  const raw = getCookie(COOKIE_NAME);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return {
      gclid: parsed.gclid || undefined,
      gbraid: parsed.gbraid || undefined,
      wbraid: parsed.wbraid || undefined,
    };
  } catch {
    return {};
  }
}

/** Extract gclid, gbraid, wbraid from URLSearchParams. */
export function extractGoogleAdsIdsFromParams(params: URLSearchParams): GoogleAdsIds {
  const gclid = params.get("gclid");
  const gbraid = params.get("gbraid");
  const wbraid = params.get("wbraid");
  const ids: GoogleAdsIds = {};
  if (gclid) ids.gclid = gclid;
  if (gbraid) ids.gbraid = gbraid;
  if (wbraid) ids.wbraid = wbraid;
  return ids;
}

/** Build query string for success_url: ?gclid=...&gbraid=...&wbraid=... */
export function toSuccessUrlParams(): string {
  const ids = getGoogleAdsIds();
  const parts: string[] = [];
  if (ids.gclid) parts.push(`gclid=${encodeURIComponent(ids.gclid)}`);
  if (ids.gbraid) parts.push(`gbraid=${encodeURIComponent(ids.gbraid)}`);
  if (ids.wbraid) parts.push(`wbraid=${encodeURIComponent(ids.wbraid)}`);
  return parts.length > 0 ? parts.join("&") : "";
}

/** 
 * Server-side: extract Google Ads IDs from cookies in request headers
 * Use in API routes or server components
 */
export function getGoogleAdsIdsFromCookies(cookieHeader: string | null): GoogleAdsIds {
  if (!cookieHeader) return {};
  
  const cookies = cookieHeader.split("; ");
  const adsCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!adsCookie) return {};
  
  try {
    const value = decodeURIComponent(adsCookie.substring(COOKIE_NAME.length + 1));
    const parsed = JSON.parse(value) as Record<string, string>;
    return {
      gclid: parsed.gclid || undefined,
      gbraid: parsed.gbraid || undefined,
      wbraid: parsed.wbraid || undefined,
    };
  } catch {
    return {};
  }
}
