"use client";

import { useEffect } from "react";
import { initPostHog, posthog } from "@/lib/posthog";
import { createSupabaseBrowserClient } from "@/server/supabase/client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();

    // Identify user if logged in
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        posthog.identify(user.id, {
          email: user.email,
        });

        // Set UTM data as user properties
        const utmRaw = localStorage.getItem("vv_utm_data");
        if (utmRaw) {
          try {
            const utm = JSON.parse(utmRaw);
            posthog.people.set({
              initial_utm_source: utm.utm_source,
              initial_utm_campaign: utm.utm_campaign,
              initial_ref: utm.ref,
            });
          } catch {}
        }
      }
    });
  }, []);

  return <>{children}</>;
}
