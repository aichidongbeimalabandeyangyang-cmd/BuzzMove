import { createSupabaseAdminClient } from "@/server/supabase/server";

// Server-side event logger (fire-and-forget)
export function logServerEvent(
  event: string,
  opts?: { email?: string; userId?: string; metadata?: Record<string, unknown> }
) {
  const supabase = createSupabaseAdminClient();
  supabase
    .from("system_events")
    .insert({
      event,
      email: opts?.email ?? null,
      user_id: opts?.userId ?? null,
      metadata: opts?.metadata ?? {},
    })
    .then(({ error }) => {
      if (error) console.error("[events] Failed to log:", event, error.message);
    });
}
