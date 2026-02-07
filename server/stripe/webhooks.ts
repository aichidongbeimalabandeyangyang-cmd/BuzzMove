import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/server/supabase/server";
import { CREDIT_PACKS, PLANS } from "@/lib/constants";

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const supabase = createSupabaseAdminClient();
  const userId = session.metadata?.supabase_user_id;
  if (!userId) return;

  if (session.metadata?.type === "credit_pack") {
    // One-time credit pack purchase
    const credits = parseInt(session.metadata.credits || "0");
    if (credits <= 0) return;

    // Add credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();

    if (!profile) return;

    await supabase
      .from("profiles")
      .update({ credits_balance: profile.credits_balance + credits })
      .eq("id", userId);

    // Record transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: credits,
      type: "purchase",
      description: `${session.metadata.pack_id} credit pack`,
      stripe_payment_id: session.payment_intent as string,
    });
  } else {
    // Subscription
    const plan = session.metadata?.plan;
    const billingPeriod = session.metadata?.billing_period;
    if (!plan) return;

    const planConfig = PLANS[plan as keyof typeof PLANS];
    const creditsPerPeriod =
      "credits_per_month" in planConfig
        ? planConfig.credits_per_month
        : (planConfig as any).credits_per_week;

    // Update profile
    await supabase
      .from("profiles")
      .update({
        subscription_plan: plan,
        subscription_status: "active",
        credits_balance: creditsPerPeriod,
      })
      .eq("id", userId);

    // Create subscription record
    await supabase.from("subscriptions").insert({
      user_id: userId,
      stripe_subscription_id: session.subscription as string,
      plan,
      billing_period: billingPeriod,
      status: "active",
      credits_per_period: creditsPerPeriod,
      current_period_start: new Date().toISOString(),
    });

    // Record transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: creditsPerPeriod,
      type: "subscription",
      description: `${plan} subscription activated`,
    });
  }
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Stripe v2026+: subscription info is under parent.subscription_details
  const subscriptionId =
    invoice.parent?.subscription_details?.subscription ?? null;
  if (!subscriptionId) return;
  const supabase = createSupabaseAdminClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*, profiles!inner(id, credits_balance)")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (!sub) return;

  // Refresh credits for the new period
  await supabase
    .from("profiles")
    .update({ credits_balance: sub.credits_per_period })
    .eq("id", sub.user_id);

  await supabase.from("credit_transactions").insert({
    user_id: sub.user_id,
    amount: sub.credits_per_period,
    type: "subscription",
    description: `${sub.plan} subscription renewed`,
  });
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const supabase = createSupabaseAdminClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (!sub) return;

  // Downgrade to free
  await supabase
    .from("profiles")
    .update({
      subscription_plan: "free",
      subscription_status: "cancelled",
    })
    .eq("id", sub.user_id);

  await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", subscription.id);
}
