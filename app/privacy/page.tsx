import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy - VibeVideo" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-[var(--muted-foreground)]">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect: email address, uploaded images (temporarily), payment
        information (processed by Stripe), device identifiers, IP-based
        geolocation, and usage analytics.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        To provide the video generation service, process payments, improve the
        Service, and comply with legal obligations.
      </p>

      <h2>3. Data Storage</h2>
      <p>
        Uploaded images are stored temporarily for video generation. Generated
        videos are stored until you delete them. We use Supabase for data
        storage with encryption at rest.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>
        We use: Supabase (database/auth), Stripe (payments), Kling AI (video
        generation), PostHog (analytics), and Cloudflare (CDN).
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You may request deletion of your account and associated data at any
        time by contacting support.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use essential cookies for authentication and analytics cookies to
        improve the Service.
      </p>
    </div>
  );
}
