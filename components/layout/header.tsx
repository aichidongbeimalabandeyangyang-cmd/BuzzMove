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

  const isHome = pathname === "/";
  const isAssets = pathname === "/dashboard" || pathname === "/dashboard/";
  const isProfile = pathname === "/dashboard/profile";
  const isSettings = pathname === "/dashboard/settings";
  const isPricing = pathname === "/pricing";

  const isGenerator = isHome && homeView === "generator";
  const isProgress = isHome && homeView === "progress";
  const isResult = isHome && homeView === "result";
  const isUpload = isHome && homeView === "upload";
  const isSubView = isGenerator || isProgress || isResult;

  const hasBackArrow = isSettings || isPricing || isSubView;
  const showLogo = (isHome && !isSubView) || isUpload;
  const showBuzzMoveText = isProfile;

  const backTitle = isSettings
    ? "Settings"
    : isPricing
      ? "Pricing & Plans"
      : isResult
        ? "Result"
        : "BuzzMove";

  const showCredits = (isAssets || isGenerator || isProgress) && user && creditData;

  const handleBack = () => {
    if (isSubView) onBackToHome();
    else router.back();
  };

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: "#0B0B0E" }}>
      {/* Header: h56, padding [0,20], space-between, center */}
      <div className="flex items-center justify-between" style={{ height: 56, padding: "0 20px" }}>
        {/* LEFT SIDE */}
        {hasBackArrow ? (
          <button onClick={handleBack} className="flex items-center" style={{ gap: 8 }}>
            <ArrowLeft style={{ width: 22, height: 22, color: "#FAFAF9" }} strokeWidth={1.5} />
            <span style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF9" }}>{backTitle}</span>
          </button>
        ) : showLogo ? (
          <Link href="/" className="flex items-center" style={{ gap: 8 }}>
            {/* Logo Icon: 28x28, cornerRadius 8, gradient */}
            <div
              className="flex items-center justify-center"
              style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
            >
              <Play style={{ width: 14, height: 14, color: "#0B0B0E" }} fill="#0B0B0E" strokeWidth={0} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF9" }}>BuzzMove</span>
          </Link>
        ) : showBuzzMoveText ? (
          <span style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF9" }}>BuzzMove</span>
        ) : isAssets ? (
          <span style={{ fontSize: 20, fontWeight: 700, color: "#FAFAF9" }}>Assets</span>
        ) : null}

        {/* RIGHT SIDE */}
        <div className="flex items-center" style={{ gap: 10 }}>
          {/* Credit Badge: cornerRadius 100, fill #16161A, padding [6,12], gap 6 */}
          {showCredits && (
            <div className="flex items-center" style={{ gap: 6, borderRadius: 100, backgroundColor: "#16161A", padding: "6px 12px" }}>
              <div style={{ width: 6, height: 6, borderRadius: 100, backgroundColor: "#E8A838" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#FAFAF9" }}>
                {formatCredits(creditData.balance)}
              </span>
            </div>
          )}
          {/* Avatar: 32x32, cornerRadius 100, fill #1E1E22 */}
          {user ? (
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: 100, backgroundColor: "#1E1E22" }}
            >
              <User style={{ width: 18, height: 18, color: "#9898A4" }} strokeWidth={1.5} />
            </Link>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: 100, backgroundColor: "#1E1E22" }}
            >
              <User style={{ width: 18, height: 18, color: "#9898A4" }} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
