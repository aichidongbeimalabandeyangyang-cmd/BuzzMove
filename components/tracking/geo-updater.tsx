"use client";

import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

const GEO_STORAGE_KEY = "vv_geo_data";

export function GeoUpdater() {
  const updateGeo = trpc.tracking.updateGeo.useMutation();

  useEffect(() => {
    async function detectGeo() {
      // Only run once per session
      const existing = sessionStorage.getItem(GEO_STORAGE_KEY);
      if (existing) return;

      try {
        // Use free IP geolocation API
        const res = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        const countryCode = data.country_code || null;
        const timezone =
          data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

        sessionStorage.setItem(
          GEO_STORAGE_KEY,
          JSON.stringify({ countryCode, timezone })
        );

        // Store country in localStorage for content policy checks
        if (countryCode) {
          localStorage.setItem("vv_country_code", countryCode);
        }

        // Update backend
        const deviceKey = localStorage.getItem("vv_device_key");
        if (deviceKey) {
          updateGeo.mutate({
            deviceKey,
            countryCode: countryCode || "UNKNOWN",
            timezone,
          });
        }
      } catch {
        // Geo detection failed — not critical
      }
    }

    // Delay to not block initial render
    const timer = setTimeout(detectGeo, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
