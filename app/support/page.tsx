import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support - BuzzMove" };

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Support</h1>

      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-2 text-lg font-bold">Email Support</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Reach us at{" "}
            <a
              href="mailto:support@buzzmove.art"
              className="text-[var(--primary)] underline"
            >
              support@buzzmove.art
            </a>
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Typical response time: within 24 hours
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-4 text-lg font-bold">FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "How long does video generation take?",
                a: "Standard mode takes ~30 seconds, Professional mode takes ~60 seconds.",
              },
              {
                q: "What happens if generation fails?",
                a: "Credits are automatically refunded to your account.",
              },
              {
                q: "Can I use videos commercially?",
                a: "Yes, all paid plans include a commercial license.",
              },
              {
                q: "How do I cancel my subscription?",
                a: "Go to Dashboard > Settings > Manage Subscription. Cancel anytime, no questions asked.",
              },
              {
                q: "Do credits expire?",
                a: "Credit pack purchases never expire. Subscription credits reset each billing period.",
              },
            ].map((item) => (
              <div key={item.q}>
                <h3 className="font-medium">{item.q}</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
