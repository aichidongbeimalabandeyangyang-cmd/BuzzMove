"use client";

import Link from "next/link";
import { User, Bell, Shield, FileText, Lock, RotateCcw } from "lucide-react";

const ICON_STYLE = { width: 20, height: 20, color: "#9898A4", flexShrink: 0 } as const;
const ITEM_STYLE = { gap: 12, padding: "14px 16px" } as const;
const LABEL_STYLE = { fontSize: 15, fontWeight: 500, color: "#FAFAF9" } as const;

function MenuItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href} className="flex w-full items-center" style={ITEM_STYLE}>
      <Icon style={ICON_STYLE} strokeWidth={1.5} />
      <span style={LABEL_STYLE}>{label}</span>
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      {/* settingsBody: gap 24, padding [24,20,12,20], h-fill */}
      <div className="flex w-full flex-1 flex-col lg:max-w-lg lg:mx-auto" style={{ gap: 24, padding: "24px 20px 12px 20px" }}>
        {/* Section 1: ACCOUNT */}
        <div className="flex w-full flex-col" style={{ gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "#6B6B70" }}>ACCOUNT</p>
          <div className="flex w-full flex-col" style={{ borderRadius: 16, backgroundColor: "#16161A", overflow: "hidden" }}>
            <MenuItem href="#" icon={User} label="Edit Profile" />
            <MenuItem href="#" icon={Bell} label="Notifications" />
            <MenuItem href="#" icon={Shield} label="Privacy & Security" />
          </div>
        </div>

        {/* Section 2: LEGAL */}
        <div className="flex w-full flex-col" style={{ gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "#6B6B70" }}>LEGAL</p>
          <div className="flex w-full flex-col" style={{ borderRadius: 16, backgroundColor: "#16161A", overflow: "hidden" }}>
            <MenuItem href="/terms" icon={FileText} label="Terms of Service" />
            <MenuItem href="/privacy" icon={Lock} label="Privacy Policy" />
            <MenuItem href="/refund-policy" icon={RotateCcw} label="Refund Policy" />
          </div>
        </div>

        {/* Version: 12/400 #4A4A50, center */}
        <p style={{ fontSize: 12, fontWeight: 400, color: "#4A4A50", textAlign: "center" }}>BuzzMove v1.0.0</p>
      </div>
    </div>
  );
}
