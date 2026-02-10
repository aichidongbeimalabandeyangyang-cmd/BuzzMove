import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description:
    "Choose the perfect BuzzMove plan for your needs. Free tier available. Generate AI videos from photos in 720p or 1080p quality.",
  alternates: {
    canonical: "https://buzzmove.me/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
