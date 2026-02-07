"use client";

import { useEffect } from "react";

const DEVICE_KEY_STORAGE = "vv_device_key";

export function DeviceKeyEnsurer() {
  useEffect(() => {
    async function ensureDeviceKey() {
      const existing = localStorage.getItem(DEVICE_KEY_STORAGE);
      if (existing) return;

      try {
        // Dynamic import to reduce bundle size
        const FingerprintJS = await import("@fingerprintjs/fingerprintjs");
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        localStorage.setItem(DEVICE_KEY_STORAGE, result.visitorId);
      } catch {
        // Fallback: generate a random ID
        const fallbackId = crypto.randomUUID().replace(/-/g, "");
        localStorage.setItem(DEVICE_KEY_STORAGE, fallbackId);
      }
    }

    ensureDeviceKey();
  }, []);

  return null;
}

export function getDeviceKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEVICE_KEY_STORAGE);
}
