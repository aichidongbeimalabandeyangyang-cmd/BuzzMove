"use client";

import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

const UTM_STORAGE_KEY = "vv_utm_data";
const REF_LINKED_KEY = "vv_ref_linked";

/**
 * After login, links the user to their referrer if a ref code was captured.
 * Must be rendered inside a tRPC provider and when user is authenticated.
 */
export function ReferralLinker({ userId }: { userId: string }) {
  const linkMutation = trpc.referral.linkFromRef.useMutation();

  useEffect(() => {
    if (!userId) return;
    if (localStorage.getItem(REF_LINKED_KEY)) return;

    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return;

    try {
      const utmData = JSON.parse(raw);
      const ref = utmData?.ref;
      if (!ref) return;

      linkMutation.mutate(
        { refCode: ref },
        {
          onSuccess: () => {
            localStorage.setItem(REF_LINKED_KEY, "true");
            // Clear the ref cookie
            document.cookie = "buzzmove_ref=; path=/; max-age=0";
          },
        }
      );
    } catch {
      // Ignore parse errors
    }
  }, [userId]);

  return null;
}
