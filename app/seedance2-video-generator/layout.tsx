import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Generator Like Seedance 2.0 — Instant Access | BuzzMove",
  description:
    "Generate stunning AI videos from photos like Seedance 2.0 — but with instant access, AI audio, and no content filters. Start free with 500 credits.",
  alternates: { canonical: "https://buzzmove.me/seedance2-video-generator" },
  openGraph: {
    title: "AI Video Generator Like Seedance 2.0 — Instant Access | BuzzMove",
    description: "Generate AI videos from photos instantly. No waitlist, AI audio included.",
    url: "https://buzzmove.me/seedance2-video-generator",
    siteName: "BuzzMove",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
