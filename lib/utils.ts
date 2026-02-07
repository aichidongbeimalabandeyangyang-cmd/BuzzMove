import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(credits: number): string {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`;
  }
  return credits.toString();
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
