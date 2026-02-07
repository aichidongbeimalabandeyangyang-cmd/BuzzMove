"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

const UTM_STORAGE_KEY = "vv_utm_data";

interface UtmData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ref: string | null;
  captured_at: string;
}

export function UtmTracker() {
  const searchParams = useSearchParams();
  const trackUtm = trpc.user.trackUtm.useMutation();

  useEffect(() => {
    // Only capture on first visit (don't overwrite existing UTM data)
    const existing = localStorage.getItem(UTM_STORAGE_KEY);
    if (existing) return;

    const utmData: UtmData = {
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      ref: searchParams.get("ref"),
      captured_at: new Date().toISOString(),
    };

    // Only store if there are actual UTM params
    const hasParams = utmData.utm_source || utmData.utm_campaign || utmData.ref;
    if (!hasParams) {
      // Store empty data to prevent re-checking
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ ...utmData, empty: true }));
      return;
    }

    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));

    // Wait for device key to be available
    const checkDeviceKey = () => {
      const deviceKey = localStorage.getItem("vv_device_key");
      if (deviceKey) {
        trackUtm.mutate({
          ...utmData,
          device_key: deviceKey,
          country_code: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } else {
        setTimeout(checkDeviceKey, 500);
      }
    };
    checkDeviceKey();
  }, [searchParams]);

  return null;
}
