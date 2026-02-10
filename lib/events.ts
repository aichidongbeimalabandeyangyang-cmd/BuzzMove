// Client-side event logger (works before auth)
export function logEvent(
  event: string,
  metadata?: Record<string, unknown> & { email?: string }
) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, email: metadata?.email, metadata }),
  }).catch(() => {
    // Fire-and-forget, never block UI
  });
}
