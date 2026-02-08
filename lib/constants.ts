// Credit costs per video generation
export const CREDIT_COSTS = {
  standard: { 5: 100, 10: 200 },
  professional: { 5: 350, 10: 700 },
} as const;

// Subscription plans
export const PLANS = {
  free: {
    name: "Free",
    credits_per_month: 9000,
    daily_free_credits: 300,
    max_concurrent: 1,
    watermark: true,
    max_quality: "480p",
    commercial_license: false,
  },
  pro: {
    name: "Pro",
    price_monthly: 3900, // cents
    price_yearly: 34800,
    credits_per_month: 30000,
    max_concurrent: 5,
    watermark: false,
    max_quality: "1080p",
    commercial_license: true,
  },
  premium: {
    name: "Premium",
    price_monthly: 9900,
    price_yearly: 94800,
    credits_per_month: 100000,
    max_concurrent: 10,
    watermark: false,
    max_quality: "1080p",
    commercial_license: true,
  },
  creator: {
    name: "Creator",
    price_weekly: 499,
    credits_per_week: 2300,
    max_concurrent: 3,
    watermark: false,
    max_quality: "1080p",
    commercial_license: true,
  },
} as const;

// Credit packs (one-time purchase)
export const CREDIT_PACKS = [
  { id: "mini", name: "Mini", credits: 1500, price: 499 },
  { id: "starter", name: "Starter", credits: 5000, price: 999 },
  { id: "creator", name: "Creator", credits: 20000, price: 2900 },
  { id: "studio", name: "Studio", credits: 50000, price: 6900 },
] as const;

// High-risk countries that force strict content policy
export const STRICT_COUNTRIES = [
  "CN", "KR", "SA", "AE", "QA", "KW", "BH", "OM",
  "PK", "BD", "MM", "TH", "ID", "MY",
] as const;

// Hero examples for homepage
export const HERO_EXAMPLES = [
  {
    id: "example-1",
    image: "/examples/hero-portrait.jpg",
    prompt: "Blowing a kiss, flirty expression, charming smile.",
    label: "Portrait",
  },
  {
    id: "example-2",
    image: "/examples/hero-portrait.jpg",
    prompt: "Slow zoom out revealing the full scene, atmospheric golden hour lighting",
    label: "Landscape",
  },
  {
    id: "example-3",
    image: "/examples/hero-portrait.jpg",
    prompt: "Product rotating slowly with dramatic lighting and reflections",
    label: "Product",
  },
] as const;

// Supported upload formats
export const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
