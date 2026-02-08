"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const price = billing === "yearly" ? "$29.00" : "$35.00";
  const perLabel = "/month";
  const saveText = billing === "yearly" ? "Save $87/year — was $435" : null;

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* titleSection: gap 12, padding [16,20,24,20], center */}
      <div className="flex flex-col items-center gap-3 px-5 pt-4 pb-6">
        {/* Heading: 28/700 #FAFAF9, letterSpacing -0.8, center */}
        <h1 className="text-[28px] font-bold tracking-tight text-center text-[#FAFAF9]" style={{ letterSpacing: "-0.8px" }}>
          Unleash your full creativity
        </h1>
        {/* Subheading: 15/400 #6B6B70, center */}
        <p className="text-[15px] text-[#6B6B70] text-center">
          Choose the plan that fits your workflow.
        </p>
        {/* Toggle Row: cornerRadius 12, fill #16161A, gap 4, padding 4 */}
        <div className="flex rounded-xl bg-[#16161A] gap-1 p-1">
          {/* Monthly */}
          <button
            onClick={() => setBilling("monthly")}
            className={`flex items-center justify-center rounded-[10px] px-5 py-2 text-sm transition-all ${
              billing === "monthly"
                ? "bg-[#E8A838] font-semibold text-[#0B0B0E]"
                : "font-medium text-[#6B6B70]"
            }`}
          >
            Monthly
          </button>
          {/* Yearly (selected) */}
          <button
            onClick={() => setBilling("yearly")}
            className={`flex items-center justify-center gap-1.5 rounded-[10px] px-5 py-2 text-sm transition-all ${
              billing === "yearly"
                ? "bg-[#E8A838] font-semibold text-[#0B0B0E]"
                : "font-medium text-[#6B6B70]"
            }`}
          >
            Yearly
            {/* Badge: cornerRadius 8, fill #22C55E, padding [2,8] */}
            {billing === "yearly" && (
              <span className="rounded-lg bg-[#22C55E] px-2 py-0.5 text-[13px] font-extrabold text-white">
                -20%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* plansArea: gap 16, padding [0,20], h-fill */}
      <div className="flex flex-1 flex-col gap-4 px-5">
        {/* Pro Card Wrapper: cornerRadius 20, gradient border, padding 1.5 */}
        <div
          className="rounded-[20px] p-[1.5px]"
          style={{ background: "linear-gradient(135deg, #F0C060, #E8A83850)" }}
        >
          {/* Pro Card: cornerRadius 19, fill #16161A, padding 20, gap 14 */}
          <div className="flex flex-col gap-3.5 rounded-[19px] bg-[#16161A] p-5">
            {/* Title Row */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {/* Title: 22/700 #FAFAF9 */}
                <h2 className="text-[22px] font-bold text-[#FAFAF9]">Professional</h2>
              </div>
              {/* MOST POPULAR badge: cornerRadius 6, fill #E8A83830, padding [3,10] */}
              <div className="self-start rounded-md bg-[#E8A83830] px-2.5 py-0.5">
                <span className="text-[10px] font-bold tracking-[0.5px] text-[#E8A838]">MOST POPULAR</span>
              </div>
            </div>

            {/* Price Row: gap 4 */}
            <div className="flex items-baseline gap-1">
              {/* Amount: 46/700 #FAFAF9, letterSpacing -1.5 */}
              <span className="text-[46px] font-bold text-[#FAFAF9]" style={{ letterSpacing: "-1.5px" }}>
                {price}
              </span>
              {/* Per: 17/400 #6B6B70 */}
              <span className="text-[17px] text-[#6B6B70]">{perLabel}</span>
            </div>

            {/* Save text: 17/700 #E8A838 */}
            {saveText && (
              <p className="text-[17px] font-bold text-[#E8A838]">{saveText}</p>
            )}

            {/* Features: gap 10, vertical */}
            <div className="flex flex-col gap-2.5">
              {[
                "30,000 credits / month",
                "No waiting — priority processing",
                "No watermark · Commercial license",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  {/* check 16x16 #E8A838 */}
                  <Check className="h-4 w-4 shrink-0 text-[#E8A838]" strokeWidth={1.5} />
                  {/* 14/500 #FAFAF9 */}
                  <span className="text-sm font-medium text-[#FAFAF9]">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA: h48, cornerRadius 14, gradient + shadow */}
            <button
              className="flex h-12 w-full items-center justify-center rounded-[14px] text-base font-bold text-[#0B0B0E] transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #F0C060, #E8A838)",
                boxShadow: "0 4px 20px #E8A83840",
              }}
            >
              Upgrade to Pro
            </button>

            {/* Urgency: 14/600 #FAFAF9, center */}
            <p className="text-center text-sm font-semibold text-[#FAFAF9]">⏰  Offer ends Feb 28</p>

            {/* Cancel: 12/400 #6B6B70, center */}
            <p className="text-center text-xs text-[#6B6B70]">Cancel anytime. No questions asked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
