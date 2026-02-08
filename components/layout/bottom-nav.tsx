"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Layers, CircleUser } from "lucide-react";

interface BottomNavProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export function BottomNav({ isLoggedIn, onLoginClick }: BottomNavProps) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Move", icon: Flame },
    { href: "/dashboard", label: "Assets", icon: Layers },
    {
      href: isLoggedIn ? "/dashboard/profile" : "#login",
      label: "My Profile",
      icon: CircleUser,
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
                <Icon className="h-[22px] w-[22px]" strokeWidth={1.5} />
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
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.5} />
              <span className={`text-[11px] ${isActive ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
