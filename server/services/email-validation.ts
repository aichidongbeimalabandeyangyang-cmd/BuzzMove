/**
 * Disposable email domain validation.
 * Uses the community-maintained `disposable-email-domains` list (~3500 domains)
 * loaded into an in-memory Set for O(1) lookups.
 */

let disposableDomains: Set<string> | null = null;

function getDisposableDomains(): Set<string> {
  if (!disposableDomains) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const domains: string[] = require("disposable-email-domains");
    disposableDomains = new Set(domains.map((d) => d.toLowerCase()));
  }
  return disposableDomains;
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  const blocklist = getDisposableDomains();

  // Direct match
  if (blocklist.has(domain)) return true;

  // Subdomain check: abc.guerrillamail.com → check guerrillamail.com
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    if (blocklist.has(parent)) return true;
  }

  return false;
}

export function validateEmailDomain(email: string): {
  valid: boolean;
  reason?: string;
} {
  if (isDisposableEmail(email)) {
    return {
      valid: false,
      reason:
        "Please use a permanent email address. Temporary email services are not supported.",
    };
  }
  return { valid: true };
}
