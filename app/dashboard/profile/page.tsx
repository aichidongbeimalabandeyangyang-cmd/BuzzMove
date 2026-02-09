"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { User, Crown, Settings, LifeBuoy, LogOut, Receipt } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile } = trpc.user.getProfile.useQuery();
  const { data: creditData } = trpc.credit.getBalance.useQuery();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayName = profile?.email?.split("@")[0] || "User";
  const planName = (profile?.subscription_plan || "free").charAt(0).toUpperCase() + (profile?.subscription_plan || "free").slice(1);
  const planLabel = `${planName} · ${formatCredits(creditData?.balance ?? 0)} credits`;

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* profileContent: gap 24, padding [24,20,12,20], h-fill, width fill */}
      <div className="flex w-full flex-1 flex-col" style={{ gap: 24, padding: "24px 20px 12px 20px" }}>

        {/* userSection: vertical, gap 12, padding [8,0], center, width fill */}
        <div className="flex w-full flex-col items-center" style={{ gap: 12, padding: "8px 0" }}>
          {/* Avatar: 72x72, cornerRadius 100, fill #1E1E22 */}
          <div
            className="flex items-center justify-center"
            style={{ width: 72, height: 72, borderRadius: 100, backgroundColor: "#1E1E22" }}
          >
            <User style={{ width: 36, height: 36, color: "#9898A4" }} strokeWidth={1.5} />
          </div>
          {/* Name: 20/700 #FAFAF9 */}
          <p style={{ fontSize: 20, fontWeight: 700, color: "#FAFAF9" }}>{displayName}</p>
          {/* Email: 14/400 #6B6B70 */}
          <p style={{ fontSize: 14, fontWeight: 400, color: "#6B6B70" }}>{profile?.email || "Loading..."}</p>
          {/* Plan Badge: cornerRadius 100, fill #E8A83820, padding [6,16], center */}
          <div
            className="flex items-center justify-center"
            style={{ borderRadius: 100, backgroundColor: "#E8A83820", padding: "6px 16px" }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E8A838" }}>{planLabel}</span>
          </div>
        </div>

        {/* menuList: cornerRadius 16, fill #16161A, vertical, width fill */}
        <div className="flex w-full flex-col" style={{ borderRadius: 16, backgroundColor: "#16161A", overflow: "hidden" }}>
          {/* m1: Pricing & Plans — gap 12, padding [14,16], icon 20x20 #E8A838, text 15/500 #FAFAF9 */}
          <Link
            href="/pricing"
            className="flex w-full items-center"
            style={{ gap: 12, padding: "14px 16px" }}
          >
            <Crown style={{ width: 20, height: 20, color: "#E8A838", flexShrink: 0 }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 500, color: "#FAFAF9" }}>Pricing & Plans</span>
          </Link>

          {/* m2: Transaction History — gap 12, padding [14,16], icon 20x20 #9898A4, text 15/500 #FAFAF9 */}
          <Link
            href="/dashboard/transactions"
            className="flex w-full items-center"
            style={{ gap: 12, padding: "14px 16px" }}
          >
            <Receipt style={{ width: 20, height: 20, color: "#9898A4", flexShrink: 0 }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 500, color: "#FAFAF9" }}>Transaction History</span>
          </Link>

          {/* m3: Settings — gap 12, padding [14,16], icon 20x20 #9898A4, text 15/500 #FAFAF9 */}
          <Link
            href="/dashboard/settings"
            className="flex w-full items-center"
            style={{ gap: 12, padding: "14px 16px" }}
          >
            <Settings style={{ width: 20, height: 20, color: "#9898A4", flexShrink: 0 }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 500, color: "#FAFAF9" }}>Settings</span>
          </Link>

          {/* m3: Help & Support — gap 12, padding [14,16], icon 20x20 #9898A4, text 15/500 #FAFAF9 */}
          <Link
            href="/support"
            className="flex w-full items-center"
            style={{ gap: 12, padding: "14px 16px" }}
          >
            <LifeBuoy style={{ width: 20, height: 20, color: "#9898A4", flexShrink: 0 }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 500, color: "#FAFAF9" }}>Help & Support</span>
          </Link>

          {/* Divider: 1px #252530, width fill */}
          <div style={{ width: "100%", height: 1, backgroundColor: "#252530" }} />

          {/* m4: Log Out — gap 12, padding [14,16], icon 20x20 #EF4444, text 15/500 #EF4444 */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center"
            style={{ gap: 12, padding: "14px 16px" }}
          >
            <LogOut style={{ width: 20, height: 20, color: "#EF4444", flexShrink: 0 }} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 500, color: "#EF4444" }}>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
