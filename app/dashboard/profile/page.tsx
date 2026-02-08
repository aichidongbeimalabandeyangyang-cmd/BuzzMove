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
      {/* profileContent: gap 24, padding [24,20,12,20], h-fill */}
      <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-3">
        {/* userSection: vertical, gap 12, padding [8,0], center, w-fill */}
        <div className="flex w-full flex-col items-center gap-3 py-2">
          {/* Avatar: 72x72, cornerRadius 100, fill #1E1E22 */}
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1E1E22]">
            {/* user icon 36x36 #9898A4 */}
            <User className="h-9 w-9 text-[#9898A4]" strokeWidth={1.5} />
          </div>
          {/* Name: 20/700 #FAFAF9 */}
          <p className="text-xl font-bold text-[#FAFAF9]">{displayName}</p>
          {/* Email: 14/400 #6B6B70 */}
          <p className="text-sm text-[#6B6B70]">{profile?.email || "Loading..."}</p>
          {/* Plan Badge: cornerRadius 100, fill #E8A83820, padding [6,16] */}
          <div className="rounded-full bg-[#E8A83820] px-4 py-1.5">
            {/* 13/600 #E8A838 */}
            <span className="text-[13px] font-semibold text-[#E8A838]">{planLabel}</span>
          </div>
        </div>

        {/* menuList: cornerRadius 16, fill #16161A, vertical */}
        <div className="overflow-hidden rounded-2xl bg-[#16161A]">
          {/* Item: gap 12, padding [14,16], center, w-fill */}
          <Link href="/pricing" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
            <Crown className="h-5 w-5 text-[#E8A838]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[#FAFAF9]">Pricing & Plans</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
            <Settings className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[#FAFAF9]">Settings</span>
          </Link>
          <Link href="/support" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
            <LifeBuoy className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[#FAFAF9]">Help & Support</span>
          </Link>
          {/* Divider: 1px #252530 */}
          <div className="h-px w-full bg-[#252530]" />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
            <LogOut className="h-5 w-5 text-[#EF4444]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[#EF4444]">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
