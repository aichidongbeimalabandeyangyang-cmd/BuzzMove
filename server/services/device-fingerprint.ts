/**
 * Server-side device fingerprint validation.
 * The actual fingerprint is generated client-side using FingerprintJS.
 * This module validates and normalizes the device key.
 */
export function validateDeviceKey(key: string): boolean {
  // FingerprintJS generates a 32-char hex string
  return /^[a-f0-9]{20,64}$/i.test(key);
}

export function normalizeDeviceKey(key: string): string {
  return key.toLowerCase().trim();
}
