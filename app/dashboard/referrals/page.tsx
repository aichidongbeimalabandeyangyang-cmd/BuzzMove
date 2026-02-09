"use client";

import { useState } from "react";
import { Copy, Check, Gift, Clock, CheckCircle, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${month} ${day}, ${time}`;
}

export default function ReferralsPage() {
  const { data: info } = trpc.referral.getInfo.useQuery();
  const { data: stats, isLoading } = trpc.referral.getStats.useQuery();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!info?.referralLink) return;
    navigator.clipboard.writeText(info.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    if (!info?.referralLink) return;
    const text = encodeURIComponent(`Turn your photos into stunning AI videos! Try BuzzMove \u{1f3ac}`);
    const url = encodeURIComponent(info.referralLink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareTelegram = () => {
    if (!info?.referralLink) return;
    const text = encodeURIComponent(`Turn your photos into stunning AI videos! Try BuzzMove \u{1f3ac}`);
    const url = encodeURIComponent(info.referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex w-full flex-1 flex-col lg:max-w-2xl lg:mx-auto" style={{ padding: "16px 20px 20px 20px", gap: 20 }}>

        {/* Stats Row */}
        <div className="flex" style={{ gap: 12 }}>
          <div className="flex flex-1 flex-col items-center justify-center" style={{ borderRadius: 16, backgroundColor: "#16161A", padding: "16px 12px", gap: 4 }}>
            <Users style={{ width: 20, height: 20, color: "#E8A838" }} strokeWidth={1.5} />
            <span style={{ fontSize: 24, fontWeight: 700, color: "#FAFAF9" }}>{stats?.totalReferrals ?? 0}</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#6B6B70" }}>Total Referrals</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center" style={{ borderRadius: 16, backgroundColor: "#16161A", padding: "16px 12px", gap: 4 }}>
            <Gift style={{ width: 20, height: 20, color: "#22C55E" }} strokeWidth={1.5} />
            <span style={{ fontSize: 24, fontWeight: 700, color: "#22C55E" }}>{formatCredits(stats?.totalCreditsEarned ?? 0)}</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#6B6B70" }}>Credits Earned</span>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="flex flex-col" style={{ borderRadius: 16, backgroundColor: "#16161A", padding: 20, gap: 14 }}>
          <div className="flex flex-col" style={{ gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>Your Referral Link</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: "#6B6B70" }}>
              Earn {formatCredits(info?.rewardCredits ?? 500)} credits for each friend who makes their first purchase.
            </span>
          </div>

          {/* Link + Copy */}
          <div className="flex items-center" style={{ gap: 8 }}>
            <div
              className="flex flex-1 items-center overflow-hidden"
              style={{ height: 44, borderRadius: 10, backgroundColor: "#0B0B0E", border: "1px solid #252530", padding: "0 12px" }}
            >
              <span className="truncate" style={{ fontSize: 13, fontWeight: 400, color: "#9898A4" }}>
                {info?.referralLink ?? "Loading..."}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center transition-all active:scale-[0.95]"
              style={{ height: 44, borderRadius: 10, padding: "0 16px", gap: 6, backgroundColor: "#E8A838", flexShrink: 0 }}
            >
              {copied ? (
                <Check style={{ width: 16, height: 16, color: "#0B0B0E" }} strokeWidth={2} />
              ) : (
                <Copy style={{ width: 16, height: 16, color: "#0B0B0E" }} strokeWidth={2} />
              )}
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0B0B0E" }}>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Share Buttons */}
          <div className="flex" style={{ gap: 10 }}>
            <button
              onClick={handleShareX}
              className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
              style={{ height: 44, borderRadius: 10, border: "1.5px solid #252530", gap: 8 }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#FAFAF9" }}>𝕏</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#FAFAF9" }}>Post to X</span>
            </button>
            <button
              onClick={handleShareTelegram}
              className="flex flex-1 items-center justify-center transition-all active:scale-[0.98]"
              style={{ height: 44, borderRadius: 10, backgroundColor: "#2AABEE", gap: 8 }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>Share on TG</span>
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="flex flex-col" style={{ borderRadius: 16, backgroundColor: "#16161A", padding: 20, gap: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>How it works</span>
          <div className="flex flex-col" style={{ gap: 12 }}>
            {[
              { step: "1", text: "Share your referral link with friends" },
              { step: "2", text: "They sign up and make their first purchase" },
              { step: "3", text: `You get ${formatCredits(info?.rewardCredits ?? 500)} credits automatically!` },
            ].map((item) => (
              <div key={item.step} className="flex items-center" style={{ gap: 12 }}>
                <div
                  className="flex items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#E8A83820", flexShrink: 0 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#E8A838" }}>{item.step}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 400, color: "#9898A4" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referral History */}
        <div className="flex w-full flex-col" style={{ gap: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "#6B6B70", marginBottom: 8 }}>
            REFERRAL HISTORY
          </span>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "40px 0", gap: 8 }}>
              <div className="relative" style={{ width: 32, height: 32 }}>
                <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
                <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
              </div>
              <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading...</span>
            </div>
          ) : !stats?.history || stats.history.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "40px 0", gap: 8 }}>
              <Gift style={{ width: 32, height: 32, color: "#4A4A50" }} strokeWidth={1.5} />
              <span style={{ fontSize: 14, color: "#6B6B70" }}>No referrals yet</span>
              <span style={{ fontSize: 12, color: "#4A4A50" }}>Share your link to start earning credits</span>
            </div>
          ) : (
            <div className="flex w-full flex-col" style={{ borderRadius: 16, backgroundColor: "#16161A", overflow: "hidden" }}>
              {stats.history.map((item, i) => {
                const isRewarded = item.status === "rewarded";
                return (
                  <div key={item.id}>
                    {i > 0 && <div style={{ height: 1, backgroundColor: "#1E1E22", margin: "0 16px" }} />}
                    <div className="flex w-full items-center" style={{ padding: "14px 16px", gap: 12 }}>
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          backgroundColor: isRewarded ? "#22C55E15" : "#6B6B7015",
                        }}
                      >
                        {isRewarded ? (
                          <CheckCircle style={{ width: 18, height: 18, color: "#22C55E" }} strokeWidth={1.5} />
                        ) : (
                          <Clock style={{ width: 18, height: 18, color: "#6B6B70" }} strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col" style={{ gap: 2, minWidth: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#FAFAF9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.refereeEmail}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 400, color: "#6B6B70" }}>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end" style={{ gap: 2, flexShrink: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: isRewarded ? "#22C55E" : "#6B6B70" }}>
                          {isRewarded ? `+${formatCredits(item.rewardCredits)}` : "Pending"}
                        </span>
                        {isRewarded ? (
                          <span style={{ fontSize: 11, fontWeight: 500, color: "#22C55E" }}>Rewarded</span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 500, color: "#6B6B70" }}>Awaiting purchase</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
