import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy - BuzzMove" };

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
      <h1>Refund Policy</h1>
      <p className="text-[var(--muted-foreground)]">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <h2>Subscriptions</h2>
      <p>
        You may cancel your subscription at any time. Cancellation takes effect
        at the end of the current billing period. We do not offer prorated
        refunds for partial billing periods.
      </p>

      <h2>Credit Packs</h2>
      <p>
        Credit pack purchases are refundable within 7 days of purchase if no
        credits have been used. Once credits are consumed, the purchase is
        non-refundable.
      </p>

      <h2>Failed Generations</h2>
      <p>
        If a video generation fails due to a system error, credits are
        automatically refunded to your account.
      </p>

      <h2>Contact</h2>
      <p>
        For refund requests, contact us at support@buzzmove.art.
      </p>
    </div>
  );
}
