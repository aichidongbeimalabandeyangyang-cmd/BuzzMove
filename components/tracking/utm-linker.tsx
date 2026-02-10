"use client";

import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

const UTM_STORAGE_KEY = "vv_utm_data";
const UTM_LINKED_KEY = "vv_utm_linked";

/**
 * After login, syncs UTM data from localStorage to the user's profile.
 * The initial trackUtm call happens before login (user is anonymous),
 * so UTM data only reaches device_channels but not profiles.
 * This component re-sends UTM data after auth so it gets written to profiles.
 */
export function UtmLinker({ userId }: { userId: string }) {
  const trackUtm = trpc.user.trackUtm.useMutation();

  useEffect(() => {
    if (!userId) return;
    if (localStorage.getItem(UTM_LINKED_KEY)) return;

    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return;

    try {
      const utmData = JSON.parse(raw);
      if (utmData.empty) return;

      const deviceKey = localStorage.getItem("vv_device_key");
      if (!deviceKey) return;

      trackUtm.mutate(
        {
          utm_source: utmData.utm_source || null,
          utm_medium: utmData.utm_medium || null,
          utm_campaign: utmData.utm_campaign || null,
          ref: utmData.ref || null,
          device_key: deviceKey,
          country_code: localStorage.getItem("vv_country_code") || null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        {
          onSuccess: () => {
            localStorage.setItem(UTM_LINKED_KEY, "true");
          },
        }
      );
    } catch {
      // Ignore parse errors
    }
  }, [userId]);

  return null;
}
