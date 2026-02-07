import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vibevideo.art";

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/explorer`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/ads`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/support`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.3 },
    { url: `${baseUrl}/refund-policy`, lastModified: new Date(), priority: 0.3 },
  ];
}
