import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuzzMove - AI Video Generator",
  description:
    "Turn your photos into stunning AI videos. Create cinematic motion from any image in seconds.",
  openGraph: {
    title: "BuzzMove - AI Video Generator",
    description:
      "Turn your photos into stunning AI videos. Create cinematic motion from any image in seconds.",
    url: "https://buzzmove.art",
    siteName: "BuzzMove",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzMove - AI Video Generator",
    description:
      "Turn your photos into stunning AI videos. Create cinematic motion from any image in seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Fonts: Sora + DM Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Sora:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Google Ads Pixel */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Twitter/X Pixel */}
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
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-4rem-5rem)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
