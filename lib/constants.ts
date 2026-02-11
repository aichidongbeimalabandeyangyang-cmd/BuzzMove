// Credit costs per video generation
// Base unit: silent 5s = 100 credits, audio doubles the cost
export const CREDIT_COSTS = {
  silent: { 5: 100, 10: 200 },
  audio: { 5: 200, 10: 400 },
} as const;

// Subscription plans (prices in cents)
export const PLANS = {
  free: {
    name: "Free",
    credits_per_month: 500,
    daily_free_credits: 0,
    max_concurrent: 1,
    watermark: true,
    max_quality: "480p",
    commercial_license: false,
  },
  pro: {
    name: "Pro",
    price_weekly: 499, // $4.99/week
    price_yearly: 18499, // $184.99/year (-29%)
    credits_per_week: 1000, // 10 std 5s videos
    credits_per_month: 4000, // yearly subscribers get monthly refresh
    trial_price_weekly: 99, // $0.99 first week
    trial_credits: 500, // 500 credits during trial week
    max_concurrent: 3,
    watermark: false,
    max_quality: "1080p",
    commercial_license: true,
  },
  premium: {
    name: "Premium",
    price_weekly: 1499, // $14.99/week
    price_yearly: 54999, // $549.99/year (-29%)
    credits_per_week: 4375, // ~44 std 5s videos
    credits_per_month: 17500, // yearly subscribers get monthly refresh
    max_concurrent: 10,
    watermark: false,
    max_quality: "1080p",
    commercial_license: true,
  },
} as const;

// Credit packs (one-time purchase, prices in cents)
export const CREDIT_PACKS = [
  { id: "mini", name: "Mini Pack", credits: 700, price: 499, tag: "QUICK START", savings: null },
  { id: "starter", name: "Starter Pack", credits: 1500, price: 999, tag: "POPULAR", savings: 7 },
  { id: "creator", name: "Creator Pack", credits: 5000, price: 2999, tag: null, savings: 16 },
  { id: "pro", name: "Pro Pack", credits: 20000, price: 9999, tag: "BEST VALUE", savings: 30 },
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

// Admin whitelist (loaded from ADMIN_EMAILS env var, comma-separated)
export const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// Referral reward
export const REFERRAL_REWARD_CREDITS = 500;

// Supported upload formats
export const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
