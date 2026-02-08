"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, User, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";

interface HeaderProps {
  user: any;
  homeView: string;
  onBackToHome: () => void;
  onLoginClick: () => void;
}

export function Header({ user, homeView, onBackToHome, onLoginClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: creditData } = trpc.credit.getBalance.useQuery(undefined, { enabled: !!user });

  // Determine which header variant to show
  const isHome = pathname === "/";
  const isAssets = pathname === "/dashboard" || pathname === "/dashboard/";
  const isProfile = pathname === "/dashboard/profile";
  const isSettings = pathname === "/dashboard/settings";
  const isPricing = pathname === "/pricing";

  // Sub-views on the homepage
  const isGenerator = isHome && homeView === "generator";
  const isProgress = isHome && homeView === "progress";
  const isResult = isHome && homeView === "result";
  const isUpload = isHome && homeView === "upload";
  const isSubView = isGenerator || isProgress || isResult;

  // Determine left side content
  const hasBackArrow = isSettings || isPricing || isSubView;
  const showLogo = (isHome && !isSubView) || isUpload;
  const showBuzzMoveText = isProfile;

  // Title for back-arrow pages
  const backTitle = isSettings
    ? "Settings"
    : isPricing
      ? "Pricing & Plans"
      : isResult
        ? "Result"
        : "BuzzMove";

  // Show credits: Assets page, Generator, Progress
  const showCredits = (isAssets || isGenerator || isProgress) && user && creditData;

  // Handle back button
  const handleBack = () => {
    if (isSubView) {
      onBackToHome();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0E]">
      {/* Header: h56, padding [0,20], space-between, center */}
      <div className="flex h-14 items-center justify-between px-5">
        {/* LEFT SIDE */}
        {hasBackArrow ? (
          <button onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-[22px] w-[22px] text-[#FAFAF9]" strokeWidth={1.5} />
            <span className="text-[17px] font-bold text-[#FAFAF9]">{backTitle}</span>
          </button>
        ) : showLogo ? (
          <Link href="/" className="flex items-center gap-2">
            {/* Logo Icon: 28x28, cornerRadius 8, gradient */}
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
            >
              <Play className="h-3.5 w-3.5 text-[#0B0B0E]" fill="#0B0B0E" strokeWidth={0} />
            </div>
            <span className="text-[17px] font-bold text-[#FAFAF9]">BuzzMove</span>
          </Link>
        ) : showBuzzMoveText ? (
          <span className="text-[17px] font-bold text-[#FAFAF9]">BuzzMove</span>
        ) : isAssets ? (
          <span className="text-xl font-bold text-[#FAFAF9]">Assets</span>
        ) : null}

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2.5">
          {/* Credit Badge: cornerRadius 100, fill #16161A, padding [6,12], gap 6 */}
          {showCredits && (
            <div className="flex items-center gap-1.5 rounded-full bg-[#16161A] px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#E8A838]" />
              <span className="text-[13px] font-semibold text-[#FAFAF9]">
                {formatCredits(creditData.balance)}
              </span>
            </div>
          )}
          {/* Avatar: 32x32, cornerRadius 100, fill #1E1E22, icon user 18x18 #9898A4 */}
          {user ? (
            <Link
              href="/dashboard/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1E22]"
            >
              <User className="h-[18px] w-[18px] text-[#9898A4]" strokeWidth={1.5} />
            </Link>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1E22]"
            >
              <User className="h-[18px] w-[18px] text-[#9898A4]" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
