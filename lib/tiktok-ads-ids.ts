/**
 * TikTok Ads click ID: ttclid
 * Capture on landing, persist in cookie, pass to TikTok for conversion attribution.
 * Similar to Google Ads gclid parameter
 */

const COOKIE_NAME = "buzzmove_tiktok_ads";
const STORAGE_KEY = "buzzmove_tiktok_ads";
const MAX_AGE_DAYS = 30;

export interface TikTokAdsIds {
  ttclid?: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp("(?:^|; )" + escapedName + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeDays: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${
    maxAgeDays * 24 * 60 * 60
  }; SameSite=Lax`;
}

/** Store ttclid. Call when URL has this param. Persists to cookie + localStorage. */
export function storeTikTokAdsIds(ids: TikTokAdsIds): void {
  const filtered: TikTokAdsIds = {};
  if (ids.ttclid?.trim()) filtered.ttclid = ids.ttclid.trim();
  if (Object.keys(filtered).length === 0) return;
  const json = JSON.stringify(filtered);
  setCookie(COOKIE_NAME, json, MAX_AGE_DAYS);
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, json);
}

/** Read stored TikTok Ads click ID. Use when firing conversion events. Reads from cookie, fallback to localStorage. */
export function getTikTokAdsIds(): TikTokAdsIds {
  let raw = getCookie(COOKIE_NAME);
  if (!raw && typeof localStorage !== "undefined") raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return { ttclid: parsed.ttclid || undefined };
  } catch {
    return {};
  }
}

/** Extract ttclid from URLSearchParams. */
export function extractTikTokAdsIdsFromParams(params: URLSearchParams): TikTokAdsIds {
  const ttclid = params.get("ttclid");
  const ids: TikTokAdsIds = {};
  if (ttclid) ids.ttclid = ttclid;
  return ids;
}

/** Build query string for success_url: ?ttclid=... */
export function toSuccessUrlParams(): string {
  const ids = getTikTokAdsIds();
  const parts: string[] = [];
  if (ids.ttclid) parts.push(`ttclid=${encodeURIComponent(ids.ttclid)}`);
  return parts.length > 0 ? parts.join("&") : "";
}

/**
 * Server-side: extract TikTok Ads IDs from cookies in request headers
 * Use in API routes or server components
 */
export function getTikTokAdsIdsFromCookies(cookieHeader: string | null): TikTokAdsIds {
  if (!cookieHeader) return {};

  const cookies = cookieHeader.split("; ");
  const adsCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!adsCookie) return {};

  try {
    const value = decodeURIComponent(adsCookie.substring(COOKIE_NAME.length + 1));
    const parsed = JSON.parse(value) as Record<string, string>;
    return {
      ttclid: parsed.ttclid || undefined,
    };
  } catch {
    return {};
  }
}
