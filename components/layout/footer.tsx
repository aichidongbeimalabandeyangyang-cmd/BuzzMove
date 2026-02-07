import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
        <p className="text-xs text-[var(--muted-foreground)]">
          &copy; {new Date().getFullYear()} VibeVideo. All rights reserved.
        </p>
        <nav className="flex gap-4">
          {[
            { href: "/terms", label: "Terms" },
            { href: "/privacy", label: "Privacy" },
            { href: "/refund-policy", label: "Refund" },
            { href: "/support", label: "Support" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
