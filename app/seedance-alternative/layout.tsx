import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Seedance 2.0 Alternative — No Waitlist | BuzzMove",
  description:
    "Looking for a Seedance alternative? BuzzMove lets you generate AI videos from photos instantly — no waitlist, no content filters, with AI audio. Start free.",
  alternates: { canonical: "https://buzzmove.me/seedance-alternative" },
  openGraph: {
    title: "Best Seedance 2.0 Alternative — No Waitlist | BuzzMove",
    description: "Generate AI videos from photos instantly. No waitlist, no restrictions, AI audio included.",
    url: "https://buzzmove.me/seedance-alternative",
    siteName: "BuzzMove",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
