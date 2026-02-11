import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const SITE_URL = "https://buzzmove.me";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BuzzMove - AI Photo to Video Generator",
    template: "%s | BuzzMove",
  },
  description:
    "Turn any photo into a stunning AI video in seconds. Upload an image, describe the motion, and watch it come alive.",
  keywords: ["AI video generator", "photo to video", "AI animation", "image to video", "AI video maker"],
  openGraph: {
    title: "BuzzMove - AI Photo to Video Generator",
    description:
      "Turn any photo into a stunning AI video in seconds. Upload an image, describe the motion, and watch it come alive.",
    url: SITE_URL,
    siteName: "BuzzMove",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BuzzMove - Turn photos into AI videos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzMove - AI Photo to Video Generator",
    description:
      "Turn any photo into a stunning AI video in seconds. Upload an image, describe the motion, and watch it come alive.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${dmSans.variable}`}>
      <head>
        <meta name="google-site-verification" content="OP2MnQVhdBcSlH6E1-9IVVAMknHs22wc0RRN9Jfvn6A" />
        {/* Google Analytics 4 + Google Ads */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-EBM4MV97XE"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){dataLayer.push(arguments);};
              gtag('js', new Date());
              gtag('config', 'G-EBM4MV97XE');
              gtag('config', 'AW-6484653792');
            `,
          }}
        />
        {process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
                },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
                a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
                twq('config','${process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID}');
              `,
            }}
          />
        )}
        {/* Adjust Web SDK */}
        <script src="https://cdn.adjust.com/adjust-latest.min.js" />
        {/* TikTok Pixel */}
        {process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function (w, d, t) {
                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
                var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
                ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID}');
                ttq.page();
                }(window, document, 'ttq');
              `,
            }}
          />
        )}
        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen antialiased">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "BuzzMove",
                  url: SITE_URL,
                  logo: `${SITE_URL}/og-image.png`,
                  sameAs: [],
                },
                {
                  "@type": "WebApplication",
                  name: "BuzzMove",
                  url: SITE_URL,
                  applicationCategory: "MultimediaApplication",
                  operatingSystem: "Web",
                  description:
                    "Turn any photo into a stunning AI video in seconds.",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    description: "Free tier available",
                  },
                },
                {
                  "@type": "WebSite",
                  url: SITE_URL,
                  name: "BuzzMove",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${SITE_URL}/?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        <Providers>
          <ErrorBoundary>
            <AppShell>{children}</AppShell>
          </ErrorBoundary>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
