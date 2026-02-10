import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unrestricted AI Video Generator — No Content Filters | BuzzMove",
  description:
    "Tired of content policy rejections? BuzzMove is an unrestricted AI video generator with no filters. Create freely with AI audio. Start free.",
  alternates: { canonical: "https://buzzmove.me/seedance-unrestricted" },
  openGraph: {
    title: "Unrestricted AI Video Generator — No Content Filters | BuzzMove",
    description: "No content filters, no rejections. Create AI videos freely with audio.",
    url: "https://buzzmove.me/seedance-unrestricted",
    siteName: "BuzzMove",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
