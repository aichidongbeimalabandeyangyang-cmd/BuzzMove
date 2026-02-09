import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/server/stripe/client";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import {
  handleCheckoutCompleted,
  handleInvoicePaid,
  handleSubscriptionDeleted,
} from "@/server/stripe/webhooks";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe] Signature verification failed:", (err as Error).message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  console.log(`[stripe] Received event: ${event.type} (${event.id})`);

  // ═══════════════════════════════════════════════════════
  // Layer 1: Event ID dedup (atomic, zero race window)
  // Stripe retries use the same event.id — INSERT with PK
  // constraint guarantees exactly-once processing.
  // ═══════════════════════════════════════════════════════
  const supabase = createSupabaseAdminClient();
  const { error: dedupError } = await supabase
    .from("processed_stripe_events")
    .insert({ event_id: event.id, event_type: event.type });

  if (dedupError) {
    // 23505 = unique_violation → already processed
    if (dedupError.code === "23505") {
      console.log(`[stripe] Duplicate event skipped: ${event.id} (${event.type})`);
      return NextResponse.json({ received: true });
    }
    // Other DB error — log but still process (fail-open for availability)
    console.error(`[stripe] Event dedup insert error: ${dedupError.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // Layer 2: Business logic (with resource-level idempotency)
  // ═══════════════════════════════════════════════════════
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
    }
  } catch (err) {
    console.error(`[stripe] Handler error for ${event.type}:`, err);
    // Return 500 so Stripe retries — but dedup record exists,
    // so we need to delete it to allow retry processing.
    await supabase
      .from("processed_stripe_events")
      .delete()
      .eq("event_id", event.id);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
