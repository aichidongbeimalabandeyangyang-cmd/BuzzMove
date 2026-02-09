"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Layers, CircleUser, Crown, Play, Gift, Shield, FileText } from "lucide-react";
import { ADMIN_EMAILS } from "@/lib/constants";

interface SidebarProps {
  isLoggedIn: boolean;
  userEmail?: string | null;
  onLoginClick: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Move", icon: Flame, match: (p: string) => p === "/" },
  { href: "/dashboard", label: "Assets", icon: Layers, match: (p: string) => p === "/dashboard" || p === "/dashboard/" },
  { href: "/dashboard/profile", label: "My Profile", icon: CircleUser, match: (p: string) => p.startsWith("/dashboard/profile") || p.startsWith("/dashboard/settings") || p.startsWith("/dashboard/transactions") },
  { href: "/dashboard/referrals", label: "Referrals", icon: Gift, match: (p: string) => p.startsWith("/dashboard/referrals") },
  { href: "/pricing", label: "Pricing", icon: Crown, match: (p: string) => p === "/pricing" },
] as const;

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: Shield, match: (p: string) => p === "/admin" },
  { href: "/admin/cases", label: "Cases", icon: FileText, match: (p: string) => p.startsWith("/admin/cases") },
] as const;

export function Sidebar({ isLoggedIn, userEmail, onLoginClick }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col" style={{ width: 240, backgroundColor: "#0B0B0E", borderRight: "1px solid #1A1A1E" }}>
      {/* Logo */}
      <Link href="/" className="flex items-center" style={{ gap: 10, padding: "18px 24px" }}>
        <div
          className="flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
        >
          <Play style={{ width: 15, height: 15, color: "#0B0B0E" }} fill="#0B0B0E" strokeWidth={0} />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF9", letterSpacing: -0.3 }}>BuzzMove</span>
      </Link>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col" style={{ padding: "8px 12px", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;
          const needsAuth = (item.label === "Assets" || item.label === "My Profile" || item.label === "Referrals") && !isLoggedIn;

          if (needsAuth) {
            return (
              <button
                key={item.label}
                onClick={onLoginClick}
                className="flex items-center transition-colors"
                style={{
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#6B6B70",
                  backgroundColor: "transparent",
                  width: "100%",
                }}
              >
                <Icon style={{ width: 20, height: 20, color: "#6B6B70" }} strokeWidth={1.5} />
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center transition-colors"
              style={{
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#E8A838" : "#9898A4",
                backgroundColor: isActive ? "#E8A83810" : "transparent",
              }}
            >
              <Icon style={{ width: 20, height: 20, color: isActive ? "#E8A838" : "#6B6B70" }} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin Section */}
      {isAdmin && (
        <nav className="flex flex-col" style={{ padding: "8px 12px", gap: 2, borderTop: "1px solid #1A1A1E" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#4A4A50", letterSpacing: 1, padding: "4px 12px" }}>ADMIN</span>
          {ADMIN_NAV.map((item) => {
            const isActive = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center transition-colors"
                style={{
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#E8A838" : "#9898A4",
                  backgroundColor: isActive ? "#E8A83810" : "transparent",
                }}
              >
                <Icon style={{ width: 20, height: 20, color: isActive ? "#E8A838" : "#6B6B70" }} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Bottom: subtle branding */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid #1A1A1E" }}>
        <p style={{ fontSize: 11, fontWeight: 400, color: "#4A4A50" }}>© {new Date().getFullYear()} BuzzMove</p>
      </div>
    </aside>
  );
}
