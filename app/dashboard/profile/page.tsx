"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/server/supabase/client";

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
        {/* User section — design: gap 12, padding [8,0] */}
        <div className="flex w-full flex-col items-center gap-3 py-2">
          {/* Avatar — design: 72x72 */}
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1E1E22]">
            <svg className="h-9 w-9 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          {/* Name — design: 20px 700 */}
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
            <svg className="h-5 w-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-[15px] font-medium text-[var(--foreground)]">Pricing & Plans</span>
          </Link>
          {/* Settings — design: settings icon 20px #9898A4, gap 12, padding [14,16] */}
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
            <svg className="h-5 w-5 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[15px] font-medium text-[var(--foreground)]">Settings</span>
          </Link>
          {/* Help — design: life-buoy icon 20px #9898A4, gap 12, padding [14,16] */}
          <Link href="/support" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
            <svg className="h-5 w-5 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796l4.138-3.448M7.288 19.67l3.448-4.138m-3.448 4.138a9.027 9.027 0 01-1.306-1.652 9.027 9.027 0 01-1.652-1.306m2.958 2.958a9.014 9.014 0 010-9.424m4.138 5.976a3.736 3.736 0 01-.88 1.388 3.737 3.737 0 01-1.388.88m2.268-2.268a3.765 3.765 0 010-2.528m-2.268 4.796l-4.138 3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976l-4.138 3.448m0-12.872l4.138 3.448m-4.138-3.448A9.027 9.027 0 015.982 4.33a9.028 9.028 0 011.306-1.652m0 0a9.014 9.014 0 019.424 0M7.288 4.33l3.448 4.138" />
            </svg>
            <span className="text-[15px] font-medium text-[var(--foreground)]">Help & Support</span>
          </Link>
          {/* Divider */}
          <div className="h-px w-full bg-[#252530]" />
          {/* Log Out — design: log-out icon 20px #EF4444, gap 12, padding [14,16] */}
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
            <svg className="h-5 w-5 text-[var(--destructive)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="text-[15px] font-medium text-[var(--destructive)]">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
