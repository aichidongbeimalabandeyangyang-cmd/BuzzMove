"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export function BottomNav({ isLoggedIn, onLoginClick }: BottomNavProps) {
  const pathname = usePathname();

  const tabs = isLoggedIn
    ? [
        { href: "/explorer", label: "Explore", icon: CompassIcon },
        { href: "/dashboard", label: "My Videos", icon: FilmIcon },
        { href: "/", label: "Create", icon: PlusIcon, primary: true },
        { href: "/pricing", label: "Pricing", icon: TagIcon },
      ]
    : [
        { href: "/explorer", label: "Explore", icon: CompassIcon },
        { href: "/", label: "Create", icon: PlusIcon, primary: true },
        { href: "/pricing", label: "Pricing", icon: TagIcon },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around px-2 pt-1.5 pb-1.5">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.primary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-0.5 -mt-3"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-[var(--background)] shadow-lg"
                  style={{ background: "linear-gradient(135deg, #e8a838, #d4942e)" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-[var(--primary)]">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}
