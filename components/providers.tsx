"use client";

import { useState, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import { PostHogProvider } from "@/components/tracking/posthog-provider";
import { DeviceKeyEnsurer } from "@/components/tracking/device-key-ensurer";
import { UtmTracker } from "@/components/tracking/utm-tracker";
import { GeoUpdater } from "@/components/tracking/geo-updater";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <PostHogProvider>
          {children}
          <DeviceKeyEnsurer />
          <Suspense fallback={null}>
            <UtmTracker />
          </Suspense>
          <GeoUpdater />
        </PostHogProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
