"use client";

import Link from "next/link";
import { User, Bell, Shield, FileText, Lock, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      {/* settingsBody: gap 24, padding [24,20,12,20], h-fill */}
      <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-3">
        {/* Section 1: ACCOUNT — gap 8 */}
        <div className="flex flex-col gap-2">
          {/* Label: 12/600 #6B6B70, letterSpacing 1px */}
          <p className="text-xs font-semibold tracking-[1px] text-[#6B6B70]">ACCOUNT</p>
          {/* Card: cornerRadius 16, fill #16161A, vertical */}
          <div className="overflow-hidden rounded-2xl bg-[#16161A]">
            <Link href="#" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
              <User className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
              <span className="text-[15px] font-medium text-[#FAFAF9]">Edit Profile</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
              <Bell className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
              <span className="text-[15px] font-medium text-[#FAFAF9]">Notifications</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
              <Shield className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
              <span className="text-[15px] font-medium text-[#FAFAF9]">Privacy & Security</span>
            </Link>
          </div>
        </div>

        {/* Section 2: LEGAL — gap 8 */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-[1px] text-[#6B6B70]">LEGAL</p>
          <div className="overflow-hidden rounded-2xl bg-[#16161A]">
            <Link href="/terms" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
              <FileText className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
              <span className="text-[15px] font-medium text-[#FAFAF9]">Terms of Service</span>
            </Link>
            <Link href="/privacy" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
              <Lock className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
              <span className="text-[15px] font-medium text-[#FAFAF9]">Privacy Policy</span>
            </Link>
            <Link href="/refund-policy" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#1E1E22]">
              <RotateCcw className="h-5 w-5 text-[#9898A4]" strokeWidth={1.5} />
              <span className="text-[15px] font-medium text-[#FAFAF9]">Refund Policy</span>
            </Link>
          </div>
        </div>

        {/* Version: 12/400 #4A4A50, center */}
        <p className="text-center text-xs text-[#4A4A50]">BuzzMove v1.0.0</p>
      </div>
    </div>
  );
}
