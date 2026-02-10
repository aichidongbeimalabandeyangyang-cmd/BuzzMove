import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { stripe } from "@/server/stripe/client";
import { PLANS, CREDIT_PACKS } from "@/lib/constants";

/** Validate or recreate Stripe customer. Handles stale/invalid customer IDs. */
async function ensureStripeCustomer(
  supabase: any,
  userId: string,
  existingCustomerId: string | null,
  email: string | null | undefined,
): Promise<string> {
  if (existingCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(existingCustomerId);
      if (!existing.deleted) return existingCustomerId;
    } catch {
      // Customer doesn't exist in Stripe — fall through to create
    }
  }

  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: { supabase_user_id: userId },
  });

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

export const paymentRouter = router({
  // Create a Stripe Checkout session for subscription
  createSubscriptionCheckout: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["pro", "premium"]),
        billingPeriod: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("stripe_customer_id, email")
        .eq("id", ctx.user.id)
        .single();

      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

      const customerId = await ensureStripeCustomer(
        ctx.supabase, ctx.user.id, profile.stripe_customer_id, profile.email || ctx.user.email
      );

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `BuzzMove ${PLANS[input.plan].name} Plan`,
              },
              unit_amount:
                input.billingPeriod === "yearly"
                  ? (PLANS[input.plan] as any).price_yearly
                  : (PLANS[input.plan] as any).price_monthly,
              recurring: {
                interval: input.billingPeriod === "yearly" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&amount=${
          (input.billingPeriod === "yearly"
            ? (PLANS[input.plan] as any).price_yearly
            : (PLANS[input.plan] as any).price_monthly) / 100
        }&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
        metadata: {
          supabase_user_id: ctx.user.id,
          plan: input.plan,
          billing_period: input.billingPeriod,
        },
      });

      return { url: session.url };
    }),

  // Create a Stripe Checkout session for credit pack purchase
  createCreditPackCheckout: protectedProcedure
    .input(z.object({ packId: z.enum(["mini", "starter", "creator", "pro"]) }))
    .mutation(async ({ ctx, input }) => {
      const pack = CREDIT_PACKS.find((p) => p.id === input.packId);
      if (!pack) throw new TRPCError({ code: "NOT_FOUND" });

      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("stripe_customer_id, email")
        .eq("id", ctx.user.id)
        .single();

      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

      const customerId = await ensureStripeCustomer(
        ctx.supabase, ctx.user.id, profile.stripe_customer_id, profile.email || ctx.user.email
      );

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `BuzzMove ${pack.name} Credit Pack (${pack.credits} credits)`,
              },
              unit_amount: pack.price,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&amount=${pack.price / 100}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
        metadata: {
          supabase_user_id: ctx.user.id,
          type: "credit_pack",
          pack_id: pack.id,
          credits: String(pack.credits),
        },
      });

      return { url: session.url };
    }),

  // Create a Stripe billing portal session
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", ctx.user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No billing account found",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });

    return { url: session.url };
  }),
});
