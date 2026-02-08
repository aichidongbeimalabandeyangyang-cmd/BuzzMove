"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export function BottomNav({ isLoggedIn, onLoginClick }: BottomNavProps) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Move", icon: FlameIcon },
    { href: "/dashboard", label: "Assets", icon: LayersIcon },
    {
      href: isLoggedIn ? "/dashboard/profile" : "#login",
      label: "My Profile",
      icon: UserCircleIcon,
      action: !isLoggedIn ? onLoginClick : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-[#0B0B0E] pb-[env(safe-area-inset-bottom)]">
      <div className="h-px w-full bg-[#1A1A1E]" />
      <div className="flex h-16 items-center justify-around pt-1.5 pb-3.5">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if ("action" in tab && tab.action) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={tab.action}
                className={`flex flex-col items-center gap-[3px] min-w-[64px] min-h-[44px] justify-center transition-colors ${
                  isActive ? "text-[var(--primary)]" : "text-[#6B6B70]"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" />
                <span className={`text-[11px] ${isActive ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center gap-[3px] min-w-[64px] min-h-[44px] justify-center transition-colors ${
                isActive ? "text-[var(--primary)]" : "text-[#6B6B70]"
              }`}
            >
              <Icon className="h-[22px] w-[22px]" />
              <span className={`text-[11px] ${isActive ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
    </svg>
  );
}

function UserCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
