import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: "linear-gradient(135deg, #e8a838, #f0c060)" }}
          >
            <svg className="h-3 w-3" fill="#050505" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            BuzzMove
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            &copy; {new Date().getFullYear()}
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { href: "/terms", label: "Terms" },
            { href: "/privacy", label: "Privacy" },
            { href: "/refund-policy", label: "Refund Policy" },
            { href: "/support", label: "Support" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
