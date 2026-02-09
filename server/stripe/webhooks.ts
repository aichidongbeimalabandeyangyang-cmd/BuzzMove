import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { CREDIT_PACKS, PLANS } from "@/lib/constants";

// ═══════════════════════════════════════════════════════════════
// Layer 2: Resource-level idempotency
//
// Even though Layer 1 (Event ID dedup in route.ts) handles the
// common case, these checks protect against:
//  - Different events triggering the same business action
//    (e.g. checkout.session.completed + invoice.paid)
//  - Manual replays or DB corruption
//
// Layer 3: DB UNIQUE index on credit_transactions.stripe_payment_id
// is the final safety net — concurrent INSERTs will fail.
// ═══════════════════════════════════════════════════════════════

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const supabase = createSupabaseAdminClient();
  const userId = session.metadata?.supabase_user_id;
  console.log(`[stripe:checkout] metadata:`, JSON.stringify(session.metadata));
  console.log(`[stripe:checkout] payment_intent: ${session.payment_intent}, userId: ${userId}`);
  if (!userId) {
    console.error("[stripe:checkout] No supabase_user_id in metadata — skipping");
    return;
  }

  if (session.metadata?.type === "credit_pack") {
    await handleCreditPackPurchase(supabase, session, userId);
  } else {
    await handleSubscriptionCreated(supabase, session, userId);
  }
}

// ── Credit Pack Purchase ─────────────────────────────────────

async function handleCreditPackPurchase(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  session: Stripe.Checkout.Session,
  userId: string
) {
  const paymentIntentId = session.payment_intent as string;
  if (!paymentIntentId) {
    console.error("[stripe:credit_pack] No payment_intent on session — skipping");
    return;
  }

  const packId = session.metadata?.pack_id;
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    console.error(`[stripe:credit_pack] Unknown pack_id: ${packId} — skipping`);
    return;
  }

  console.log(`[stripe:credit_pack] Processing ${pack.name} (${pack.credits} credits) for ${userId}, PI: ${paymentIntentId}`);

  // INSERT transaction first — UNIQUE index on stripe_payment_id
  // guarantees this fails on duplicate (Layer 3 safety net).
  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: pack.credits,
    type: "purchase",
    description: `${pack.name} credit pack`,
    stripe_payment_id: paymentIntentId,
  });

  if (txError) {
    // 23505 = unique_violation → already processed
    if (txError.code === "23505") {
      console.log(`[stripe:credit_pack] Duplicate payment skipped: ${paymentIntentId}`);
      return;
    }
    // Unexpected error — rethrow so route.ts can handle retry
    throw new Error(`credit_transaction insert failed: ${txError.message}`);
  }

  // Transaction recorded → safe to add credits
  const { data: newBalance, error: rpcError } = await supabase.rpc("refund_credits", {
    p_user_id: userId,
    p_amount: pack.credits,
  });

  if (rpcError) {
    console.error(`[stripe:credit_pack] refund_credits RPC failed:`, rpcError.message);
    throw new Error(`refund_credits failed: ${rpcError.message}`);
  }

  console.log(`[stripe:credit_pack] +${pack.credits} credits for ${userId} (${pack.name}), new balance: ${newBalance}`);
}

// ── Subscription Created ─────────────────────────────────────

async function handleSubscriptionCreated(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  session: Stripe.Checkout.Session,
  userId: string
) {
  const plan = session.metadata?.plan as keyof typeof PLANS;
  const billingPeriod = session.metadata?.billing_period;
  const stripeSubId = session.subscription as string;

  if (!plan || !(plan in PLANS) || plan === "free") return;
  if (!stripeSubId) return;

  const planConfig = PLANS[plan];
  const creditsPerPeriod = planConfig.credits_per_month;

  // INSERT subscription record — if it already exists, skip.
  const { error: subError } = await supabase.from("subscriptions").insert({
    user_id: userId,
    stripe_subscription_id: stripeSubId,
    plan,
    billing_period: billingPeriod,
    status: "active",
    credits_per_period: creditsPerPeriod,
    current_period_start: new Date().toISOString(),
  });

  if (subError) {
    // Duplicate stripe_subscription_id → already processed
    if (subError.code === "23505") {
      console.log(`[stripe:subscription] Duplicate subscription skipped: ${stripeSubId}`);
      return;
    }
    throw new Error(`subscription insert failed: ${subError.message}`);
  }

  // Subscription recorded → update profile & log transaction
  await supabase
    .from("profiles")
    .update({
      subscription_plan: plan,
      subscription_status: "active",
      credits_balance: creditsPerPeriod,
    })
    .eq("id", userId);

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: creditsPerPeriod,
    type: "subscription",
    description: `${planConfig.name} subscription activated`,
    stripe_payment_id: `sub_activated_${stripeSubId}`,
  });

  console.log(`[stripe:subscription] ${plan} activated for ${userId}, +${creditsPerPeriod} credits`);
}

// ── Invoice Paid (Subscription Renewal) ──────────────────────

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const stripeSubId =
    invoice.parent?.subscription_details?.subscription ?? null;
  if (!stripeSubId) return;

  const invoiceId = invoice.id;
  if (!invoiceId) return;

  const supabase = createSupabaseAdminClient();

  // Look up subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id, plan, credits_per_period, created_at")
    .eq("stripe_subscription_id", stripeSubId)
    .single();

  // If subscription record doesn't exist yet, checkout handler
  // hasn't run — skip. Stripe will retry or checkout will handle it.
  if (!sub) return;

  // Skip the initial invoice — checkout.session.completed already
  // granted credits. We detect this by checking if the subscription
  // was created recently. No more fragile time-based hacks:
  // instead, we use the invoice ID as idempotency key.
  const txKey = `invoice_${invoiceId}`;

  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: sub.user_id,
    amount: sub.credits_per_period,
    type: "subscription",
    description: `${sub.plan} subscription renewed`,
    stripe_payment_id: txKey,
  });

  if (txError) {
    if (txError.code === "23505") {
      console.log(`[stripe:invoice] Duplicate invoice skipped: ${invoiceId}`);
      return;
    }
    throw new Error(`invoice transaction insert failed: ${txError.message}`);
  }

  // For the FIRST invoice (created alongside checkout), the checkout
  // handler already set credits_balance. But since our INSERT succeeded
  // (meaning this invoice hasn't been processed before), we should
  // refresh credits. This covers both initial and renewal invoices
  // uniformly — the extra SET on initial is harmless (same value).
  await supabase
    .from("profiles")
    .update({ credits_balance: sub.credits_per_period })
    .eq("id", sub.user_id);

  console.log(`[stripe:invoice] Renewed ${sub.plan} for ${sub.user_id}, reset to ${sub.credits_per_period} credits`);
}

// ── Subscription Deleted ─────────────────────────────────────

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const supabase = createSupabaseAdminClient();

  // Atomic update: only change if not already cancelled
  const { data: updated, error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", subscription.id)
    .neq("status", "cancelled")
    .select("user_id")
    .single();

  // No rows updated → already cancelled or doesn't exist
  if (!updated) {
    console.log(`[stripe:cancel] Already cancelled or not found: ${subscription.id}`);
    return;
  }

  await supabase
    .from("profiles")
    .update({
      subscription_plan: "free",
      subscription_status: "cancelled",
    })
    .eq("id", updated.user_id);

  console.log(`[stripe:cancel] Subscription cancelled for ${updated.user_id}`);
}
