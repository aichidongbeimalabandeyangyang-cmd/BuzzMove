"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Layers, CircleUser } from "lucide-react";

interface BottomNavProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const TABS = [
  { href: "/", label: "Move", icon: Flame, match: (p: string) => p === "/" },
  { href: "/dashboard", label: "Assets", icon: Layers, match: (p: string) => p === "/dashboard" || p === "/dashboard/" },
  { href: "/dashboard/profile", label: "My Profile", icon: CircleUser, match: (p: string) => p.startsWith("/dashboard/profile") || p.startsWith("/dashboard/settings") || p.startsWith("/pricing") },
] as const;

export function BottomNav({ isLoggedIn, onLoginClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 sm:hidden bg-[#0B0B0E] pb-[env(safe-area-inset-bottom)]">
      {/* Tab separator: 1px #1A1A1E */}
      <div className="h-px w-full bg-[#1A1A1E]" />
      {/* BottomTab: h64, justify-around, padding [6,0,14,0] */}
      <div className="flex h-16 items-center justify-around pt-1.5 pb-3.5">
        {TABS.map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;
          const colorClass = isActive ? "text-[#E8A838]" : "text-[#6B6B70]";
          const weightClass = isActive ? "font-semibold" : "font-medium";

          // Profile tab: if not logged in, show button that opens login
          if (tab.label === "My Profile" && !isLoggedIn) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={onLoginClick}
                className={`flex flex-col items-center gap-[3px] min-w-[64px] min-h-[44px] justify-center ${colorClass}`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={1.5} />
                <span className={`text-[11px] ${weightClass}`}>{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center gap-[3px] min-w-[64px] min-h-[44px] justify-center ${colorClass}`}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.5} />
              <span className={`text-[11px] ${weightClass}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
