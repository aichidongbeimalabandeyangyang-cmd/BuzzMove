/**
 * Image safety checks before video generation.
 *
 * Two independent checks controlled by env vars:
 *   config_m → minor/child detection (internal age_detect service)
 *   config_n → NSFW detection (internal nsfw_detect service)
 *
 * Both default OFF. Set to "true" to enable.
 */

import { logServerEvent } from "./events";

/** Block age categories 0, 1 (0–9 years) — matches Go service threshold */
const MAX_BLOCKED_AGE_CATEGORY = 1;

/** Read env vars at runtime (not build time) */
function getConfig() {
  return {
    serviceUrl: process.env.config_service_url ?? "",
    authKey: process.env.config_service_key ?? "",
    minorEnabled: process.env.config_m === "true",
    nsfwEnabled: process.env.config_n === "true",
  };
}

// ─── Types ───

interface SafetyResult {
  safe: boolean;
  reason?:
    | "minor_detected"
    | "nsfw_detected"
    | "no_face"
    | "safety_check_failed"
    | "skipped";
  ageCategory?: number;
}

// ─── Minor detection (config_m) ───

async function checkMinor(
  imageUrl: string,
  userId: string
): Promise<SafetyResult> {
  try {
    const { serviceUrl, authKey } = getConfig();
    const res = await fetch(`${serviceUrl}/age_detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Key": authKey },
      body: JSON.stringify({ image: imageUrl }),
      signal: AbortSignal.timeout(2_000),
    });

    if (!res.ok) {
      logServerEvent("image_safety_error", {
        userId,
        metadata: { imageUrl, check: "minor", status: res.status },
      });
      return { safe: false, reason: "safety_check_failed" };
    }

    const body = (await res.json()) as {
      code: number;
      msg: string;
      data: { age: number };
    };

    if (body.code !== 0) {
      logServerEvent("image_safety_error", {
        userId,
        metadata: { imageUrl, check: "minor", code: body.code, msg: body.msg },
      });
      return { safe: false, reason: "safety_check_failed" };
    }

    const age = body.data.age;

    if (age === -1) {
      return { safe: true, reason: "no_face", ageCategory: age };
    }

    if (age >= 0 && age <= MAX_BLOCKED_AGE_CATEGORY) {
      logServerEvent("image_safety_blocked", {
        userId,
        metadata: { imageUrl, check: "minor", ageCategory: age },
      });
      return { safe: false, reason: "minor_detected", ageCategory: age };
    }

    return { safe: true, ageCategory: age };
  } catch (error) {
    logServerEvent("image_safety_error", {
      userId,
      metadata: {
        imageUrl,
        check: "minor",
        error: error instanceof Error ? error.message : "Unknown",
      },
    });
    return { safe: false, reason: "safety_check_failed" };
  }
}

// ─── NSFW detection (config_n) ───

async function checkNsfw(
  imageUrl: string,
  userId: string
): Promise<SafetyResult> {
  try {
    const { serviceUrl, authKey } = getConfig();
    const res = await fetch(`${serviceUrl}/nsfw_detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Key": authKey },
      body: JSON.stringify({ image: imageUrl }),
      signal: AbortSignal.timeout(2_000),
    });

    if (!res.ok) {
      logServerEvent("image_safety_error", {
        userId,
        metadata: { imageUrl, check: "nsfw", status: res.status },
      });
      return { safe: false, reason: "safety_check_failed" };
    }

    const body = (await res.json()) as {
      code: number;
      msg: string;
      data: { nsfw: boolean };
    };

    if (body.code !== 0) {
      logServerEvent("image_safety_error", {
        userId,
        metadata: { imageUrl, check: "nsfw", code: body.code, msg: body.msg },
      });
      return { safe: false, reason: "safety_check_failed" };
    }

    if (body.data.nsfw) {
      logServerEvent("image_safety_blocked", {
        userId,
        metadata: { imageUrl, check: "nsfw" },
      });
      return { safe: false, reason: "nsfw_detected" };
    }

    return { safe: true };
  } catch (error) {
    logServerEvent("image_safety_error", {
      userId,
      metadata: {
        imageUrl,
        check: "nsfw",
        error: error instanceof Error ? error.message : "Unknown",
      },
    });
    return { safe: false, reason: "safety_check_failed" };
  }
}

// ─── Public API ───

export async function checkImageSafety(
  imageUrl: string,
  userId: string
): Promise<SafetyResult> {
  const { minorEnabled, nsfwEnabled } = getConfig();

  if (!minorEnabled && !nsfwEnabled) {
    return { safe: true, reason: "skipped" };
  }

  // Run enabled checks in parallel
  const [minorResult, nsfwResult] = await Promise.all([
    minorEnabled ? checkMinor(imageUrl, userId) : null,
    nsfwEnabled ? checkNsfw(imageUrl, userId) : null,
  ]);

  // Both fail-open: only block confirmed detections, allow on service errors
  if (minorResult && !minorResult.safe && minorResult.reason !== "safety_check_failed") {
    return minorResult;
  }
  if (nsfwResult && !nsfwResult.safe && nsfwResult.reason !== "safety_check_failed") {
    return nsfwResult;
  }

  return { safe: true };
}
