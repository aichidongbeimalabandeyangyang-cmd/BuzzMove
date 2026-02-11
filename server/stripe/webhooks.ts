import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { CREDIT_PACKS, PLANS, REFERRAL_REWARD_CREDITS } from "@/lib/constants";

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

  // Referral reward: if this user was referred and this is their first payment
  await processReferralReward(supabase, userId);
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
    price_cents: pack.price,
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

  const planConfig = PLANS[plan] as any;
  const withTrial = session.metadata?.with_trial === "true";

  // Determine credits for this period
  let creditsPerPeriod: number;
  let initialCredits: number;

  if (billingPeriod === "yearly") {
    // Yearly: use monthly credits (refreshed monthly by invoice)
    creditsPerPeriod = planConfig.credits_per_month;
    initialCredits = planConfig.credits_per_month;
  } else {
    // Weekly: use weekly credits
    creditsPerPeriod = planConfig.credits_per_week;
    // Trial week gets reduced credits
    initialCredits = withTrial && planConfig.trial_credits
      ? planConfig.trial_credits
      : planConfig.credits_per_week;
  }

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

  // Subscription recorded → update profile plan & add credits atomically
  await supabase
    .from("profiles")
    .update({
      subscription_plan: plan,
      subscription_status: "active",
    })
    .eq("id", userId);

  const { error: rpcError } = await supabase.rpc("refund_credits", {
    p_user_id: userId,
    p_amount: initialCredits,
  });
  if (rpcError) {
    console.error(`[stripe:subscription] refund_credits RPC failed:`, rpcError.message);
    throw new Error(`refund_credits failed: ${rpcError.message}`);
  }

  const priceCents = billingPeriod === "yearly"
    ? planConfig.price_yearly
    : withTrial && planConfig.trial_price_weekly
      ? planConfig.trial_price_weekly
      : planConfig.price_weekly;

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: initialCredits,
    type: "subscription",
    description: withTrial
      ? `${planConfig.name} trial activated ($0.99 first week)`
      : `${planConfig.name} subscription activated`,
    stripe_payment_id: `sub_activated_${stripeSubId}`,
    price_cents: priceCents,
  });

  console.log(`[stripe:subscription] ${plan} activated for ${userId}, +${initialCredits} credits${withTrial ? " (trial)" : ""}`);
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

  // Skip the initial invoice — handleCheckoutCompleted already granted credits.
  // Detect by checking if subscription was created within the last 2 minutes.
  const subCreatedAt = new Date(sub.created_at).getTime();
  const now = Date.now();
  if (now - subCreatedAt < 2 * 60 * 1000) {
    console.log(`[stripe:invoice] Skipping initial invoice for ${sub.user_id} (sub created ${Math.round((now - subCreatedAt) / 1000)}s ago)`);
    return;
  }

  const txKey = `invoice_${invoiceId}`;

  // Look up plan config for price
  const planKey = sub.plan as keyof typeof PLANS;
  const planConfig = planKey in PLANS ? (PLANS[planKey] as any) : null;
  // Weekly renewals use price_weekly, yearly renewals use price_yearly / 12 (approx)
  const priceCents = planConfig && "price_weekly" in planConfig ? planConfig.price_weekly : 0;

  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: sub.user_id,
    amount: sub.credits_per_period,
    type: "subscription",
    description: `${sub.plan} subscription renewed`,
    stripe_payment_id: txKey,
    price_cents: priceCents,
  });

  if (txError) {
    if (txError.code === "23505") {
      console.log(`[stripe:invoice] Duplicate invoice skipped: ${invoiceId}`);
      return;
    }
    throw new Error(`invoice transaction insert failed: ${txError.message}`);
  }

  // Renewal: ADD credits to existing balance (not overwrite)
  const { error: rpcError } = await supabase.rpc("refund_credits", {
    p_user_id: sub.user_id,
    p_amount: sub.credits_per_period,
  });

  if (rpcError) {
    console.error(`[stripe:invoice] refund_credits RPC failed:`, rpcError.message);
    throw new Error(`refund_credits failed: ${rpcError.message}`);
  }

  console.log(`[stripe:invoice] Renewed ${sub.plan} for ${sub.user_id}, +${sub.credits_per_period} credits`);
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

// ── Referral Reward ──────────────────────────────────────────

async function processReferralReward(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  refereeId: string
) {
  // Find pending referral for this user
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, referrer_id, reward_credits")
    .eq("referee_id", refereeId)
    .eq("status", "pending")
    .single();

  if (!referral) return; // Not referred or already rewarded

  // Atomically mark as rewarded (optimistic lock prevents double-reward)
  const { data: updated } = await supabase
    .from("referrals")
    .update({ status: "rewarded", rewarded_at: new Date().toISOString() })
    .eq("id", referral.id)
    .eq("status", "pending")
    .select("id")
    .single();

  if (!updated) return; // Already rewarded by concurrent webhook

  // Add credits to referrer
  const { error: rpcError } = await supabase.rpc("refund_credits", {
    p_user_id: referral.referrer_id,
    p_amount: referral.reward_credits,
  });

  if (rpcError) {
    console.error(`[referral] refund_credits failed for referrer ${referral.referrer_id}:`, rpcError.message);
    return;
  }

  // Log transaction
  await supabase.from("credit_transactions").insert({
    user_id: referral.referrer_id,
    amount: referral.reward_credits,
    type: "referral",
    description: "Referral reward - friend made first purchase",
    stripe_payment_id: `referral_${referral.id}`,
  });

  console.log(`[referral] +${referral.reward_credits} credits to referrer ${referral.referrer_id} for referee ${refereeId}`);
}
