"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Layers, Gift } from "lucide-react";

interface BottomNavProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const TABS = [
  { href: "/", label: "Move", icon: Flame, match: (p: string) => p === "/" },
  { href: "/dashboard", label: "Assets", icon: Layers, match: (p: string) => p === "/dashboard" || p === "/dashboard/" },
  { href: "/dashboard/referrals", label: "Earn 500", icon: Gift, match: (p: string) => p.startsWith("/dashboard/referrals"), highlight: true },
] as const;

export function BottomNav({ isLoggedIn, onLoginClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 sm:hidden" style={{ backgroundColor: "#0B0B0E", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Tab separator: 1px #1A1A1E */}
      <div style={{ width: "100%", height: 1, backgroundColor: "#1A1A1E" }} />
      {/* BottomTab: h64, justify-around, padding [6,0,14,0] */}
      <div className="flex items-center justify-around" style={{ height: 64, padding: "6px 0 14px 0" }}>
        {TABS.map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;
          const color = isActive ? "#E8A838" : "#6B6B70";
          const weight = isActive ? 600 : 500;

          const hasHighlight = "highlight" in tab && tab.highlight;

          const iconEl = (
            <div className="relative">
              <Icon style={{ width: 22, height: 22, color: hasHighlight && !isActive ? "#E8A838" : color }} strokeWidth={1.5} />
              {hasHighlight && !isActive && (
                <div className="absolute animate-pulse" style={{ top: -2, right: -4, width: 7, height: 7, borderRadius: 100, backgroundColor: "#EF4444", border: "1.5px solid #0B0B0E" }} />
              )}
            </div>
          );

          if ((tab.label === "Assets" || tab.label === "Earn 500") && !isLoggedIn) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={onLoginClick}
                className="flex flex-col items-center justify-center"
                style={{ gap: 3, minWidth: 64, minHeight: 44 }}
              >
                {iconEl}
                <span style={{ fontSize: 11, fontWeight: hasHighlight ? 600 : weight, color: hasHighlight && !isActive ? "#E8A838" : color }}>{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              onClick={() => {
                if (tab.href === "/" && pathname === "/") {
                  window.dispatchEvent(new Event("navigate-home"));
                }
              }}
              className="flex flex-col items-center justify-center"
              style={{ gap: 3, minWidth: 64, minHeight: 44 }}
            >
              {iconEl}
              <span style={{ fontSize: 11, fontWeight: hasHighlight ? 600 : weight, color: hasHighlight && !isActive ? "#E8A838" : color }}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
