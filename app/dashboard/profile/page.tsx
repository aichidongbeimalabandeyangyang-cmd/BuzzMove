"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { User, Crown, Settings, LifeBuoy, LogOut } from "lucide-react";

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
  const planLabel = `${(profile?.subscription_plan || "free").charAt(0).toUpperCase() + (profile?.subscription_plan || "free").slice(1)} · ${formatCredits(creditData?.balance ?? 0)} credits`;

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Profile content — design: gap 24, padding [24,20,12,20] */}
      <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-3">
        {/* User section — design: gap 12, padding [8,0], center aligned */}
        <div className="flex w-full flex-col items-center gap-3 py-2">
          {/* Avatar — design: 72x72, cornerRadius 100, fill #1E1E22 */}
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1E1E22]">
            <User className="h-9 w-9 text-[#9898A4]" strokeWidth={1.5} />
          </div>
          {/* Name — design: 20px 700 #FAFAF9 */}
          <p className="text-xl font-bold text-[var(--foreground)]">{displayName}</p>
          {/* Email — design: 14px normal #6B6B70 */}
          <p className="text-sm text-[#6B6B70]">{profile?.email || "Loading..."}</p>
          {/* Plan badge — design: 13px 600 #E8A838, bg #E8A83820, padding [6,16], cornerRadius 100 */}
          <div className="rounded-full bg-[#E8A83820] px-4 py-1.5">
            <span className="text-[13px] font-semibold text-[var(--primary)]">{planLabel}</span>
          </div>
        </div>

        {/* Menu list — design: cornerRadius 16, fill #16161A */}
        <div className="overflow-hidden rounded-2xl bg-[#16161A]">
          {/* Pricing — design: crown icon 20px #E8A838, gap 12, padding [14,16] */}
          <Link href="/pricing" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
            <Crown className="h-5 w-5 text-[var(--primary)]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[var(--foreground)]">Pricing & Plans</span>
          </Link>
          {/* Settings — design: settings icon 20px #9898A4, gap 12, padding [14,16] */}
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
            <Settings className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[var(--foreground)]">Settings</span>
          </Link>
          {/* Help — design: life-buoy icon 20px #9898A4, gap 12, padding [14,16] */}
          <Link href="/support" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
            <LifeBuoy className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[var(--foreground)]">Help & Support</span>
          </Link>
          {/* Divider */}
          <div className="h-px w-full bg-[#252530]" />
          {/* Log Out — design: log-out icon 20px #EF4444, gap 12, padding [14,16] */}
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
            <LogOut className="h-5 w-5 text-[var(--destructive)]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[var(--destructive)]">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
