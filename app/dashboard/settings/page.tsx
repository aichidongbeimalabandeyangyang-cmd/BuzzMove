"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function SettingsPage() {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const portalMutation = trpc.payment.createPortalSession.useMutation({
    onSuccess(data) { if (data.url) window.location.href = data.url; },
  });

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 px-5 py-6">
        {/* ACCOUNT section */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-[1px] text-[#6B6B70]">ACCOUNT</p>
          <div className="overflow-hidden rounded-2xl bg-[#16161A]">
            <Link href="#" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
              <svg className="h-5 w-5 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="text-[15px] font-medium text-[var(--foreground)]">Edit Profile</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
              <svg className="h-5 w-5 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="text-[15px] font-medium text-[var(--foreground)]">Notifications</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
              <svg className="h-5 w-5 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-[15px] font-medium text-[var(--foreground)]">Privacy & Security</span>
            </Link>
          </div>
        </div>

        {/* LEGAL section */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-[1px] text-[#6B6B70]">LEGAL</p>
          <div className="overflow-hidden rounded-2xl bg-[#16161A]">
            <Link href="/terms" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
              <svg className="h-5 w-5 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-[15px] font-medium text-[var(--foreground)]">Terms of Service</span>
            </Link>
            <Link href="/privacy" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
              <svg className="h-5 w-5 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-[15px] font-medium text-[var(--foreground)]">Privacy Policy</span>
            </Link>
            <Link href="/refund-policy" className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--secondary)]">
              <svg className="h-5 w-5 text-[#9898A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              <span className="text-[15px] font-medium text-[var(--foreground)]">Refund Policy</span>
            </Link>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-[#4A4A50]">BuzzMove v1.0.0</p>
      </div>
    </div>
  );
}
