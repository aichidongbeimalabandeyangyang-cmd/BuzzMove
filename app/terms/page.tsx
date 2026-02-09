import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the BuzzMove Terms of Service. Learn about usage rules, content policies, and user responsibilities for our AI video generation platform.",
  alternates: { canonical: "https://buzzmove.me/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert prose-headings:font-[Sora] prose-headings:text-[var(--foreground)] prose-p:text-[var(--foreground-80)] prose-a:text-[var(--primary)]">
      <h1>Terms of Service</h1>
      <p className="text-[var(--muted-foreground)]">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using BuzzMove (&quot;Service&quot;), you agree to be
        bound by these Terms of Service. If you do not agree, do not use the
        Service.
      </p>

      <h2>2. Service Description</h2>
      <p>
        BuzzMove provides AI-powered video generation from images. The Service
        uses third-party AI models to generate video content based on user
        inputs.
      </p>

      <h2>3. User Responsibilities</h2>
      <p>
        You are solely responsible for the content you upload and the videos you
        generate. You must not use the Service to create content that violates
        any applicable laws or regulations.
      </p>

      <h2>4. Credits and Payments</h2>
      <p>
        Credits are consumed when generating videos. Unused subscription credits
        do not roll over. Credit pack purchases are non-refundable once credits
        have been used.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        You retain ownership of images you upload. Videos generated through paid
        plans include commercial usage rights. Free plan videos are for personal
        use only.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties. We are not
        liable for any damages arising from your use of the Service.
      </p>

      <h2>7. Changes to Terms</h2>
      <p>
        We may update these terms at any time. Continued use of the Service
        constitutes acceptance of updated terms.
      </p>
    </div>
  );
}
