"use client";

import { trpc } from "@/lib/trpc";
import { formatCredits } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw } from "lucide-react";

function getTypeInfo(type: string) {
  switch (type) {
    case "purchase":
      return { label: "Credit Pack", icon: CreditCard, color: "#22C55E", sign: "+" };
    case "subscription":
      return { label: "Subscription", icon: ArrowUpRight, color: "#22C55E", sign: "+" };
    case "deduction":
      return { label: "Video Generation", icon: ArrowDownLeft, color: "#EF4444", sign: "-" };
    case "refund":
      return { label: "Refund", icon: RefreshCw, color: "#3B82F6", sign: "+" };
    default:
      return { label: type, icon: CreditCard, color: "#6B6B70", sign: "" };
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${month} ${day}, ${time}`;
}

export default function TransactionsPage() {
  const { data: transactions, isLoading } = trpc.credit.getHistory.useQuery();
  const { data: creditData } = trpc.credit.getBalance.useQuery();

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex w-full flex-1 flex-col" style={{ padding: "16px 20px 20px 20px", gap: 20 }}>

        {/* Balance summary card */}
        <div
          className="flex w-full items-center justify-between"
          style={{ borderRadius: 16, backgroundColor: "#16161A", padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Current Balance</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#FAFAF9" }}>
              {formatCredits(creditData?.balance ?? 0)}
            </span>
          </div>
          <div
            className="flex items-center justify-center"
            style={{ borderRadius: 100, backgroundColor: "#E8A83820", padding: "6px 14px" }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E8A838" }}>
              {(creditData?.plan ?? "free").charAt(0).toUpperCase() + (creditData?.plan ?? "free").slice(1)} Plan
            </span>
          </div>
        </div>

        {/* Transaction list */}
        <div className="flex w-full flex-col" style={{ gap: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "#6B6B70", marginBottom: 8 }}>
            RECENT TRANSACTIONS
          </span>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "40px 0", gap: 8 }}>
              <div className="relative" style={{ width: 32, height: 32 }}>
                <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
                <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
              </div>
              <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading...</span>
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "40px 0", gap: 8 }}>
              <CreditCard style={{ width: 32, height: 32, color: "#4A4A50" }} strokeWidth={1.5} />
              <span style={{ fontSize: 14, color: "#6B6B70" }}>No transactions yet</span>
              <span style={{ fontSize: 12, color: "#4A4A50" }}>Your credit activity will appear here</span>
            </div>
          ) : (
            <div className="flex w-full flex-col" style={{ borderRadius: 16, backgroundColor: "#16161A", overflow: "hidden" }}>
              {transactions.map((tx, i) => {
                const info = getTypeInfo(tx.type);
                const Icon = info.icon;
                const isNegative = tx.type === "deduction";

                return (
                  <div key={tx.id}>
                    {i > 0 && <div style={{ height: 1, backgroundColor: "#1E1E22", margin: "0 16px" }} />}
                    <div className="flex w-full items-center" style={{ padding: "14px 16px", gap: 12 }}>
                      {/* Icon */}
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: `${info.color}15`,
                          flexShrink: 0,
                        }}
                      >
                        <Icon style={{ width: 18, height: 18, color: info.color }} strokeWidth={1.5} />
                      </div>

                      {/* Description & date */}
                      <div className="flex flex-1 flex-col" style={{ gap: 2, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#FAFAF9",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tx.description || info.label}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 400, color: "#6B6B70" }}>
                          {formatDate(tx.created_at)}
                        </span>
                      </div>

                      {/* Amount */}
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: isNegative ? "#EF4444" : "#22C55E",
                          flexShrink: 0,
                        }}
                      >
                        {info.sign}{formatCredits(Math.abs(tx.amount))}
                      </span>
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
