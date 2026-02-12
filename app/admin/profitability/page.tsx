"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProfitabilityPage() {
  const { data, isLoading, error } = trpc.admin.getUserProfitability.useQuery();

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center" style={{ gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#EF4444" }}>Access Denied</span>
          <span style={{ fontSize: 14, color: "#6B6B70" }}>{error.message}</span>
        </div>
      </div>
    );
  }

  const users = data?.users ?? [];
  const totalRevenue = users.reduce((s, u) => s + u.totalRevenueCents, 0);
  const totalCost = users.reduce((s, u) => s + u.costCents, 0);
  const totalProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  return (
    <div className="flex w-full flex-1 flex-col" style={{ padding: 20, gap: 20, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: 12 }}>
          <Link href="/admin" className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>User Profitability</h1>
          <span style={{ fontSize: 13, color: "#6B6B70" }}>{users.length} users</span>
        </div>
      </div>

      {/* Summary Cards */}
      {!isLoading && users.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: 10 }}>
          <div className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "16px 18px", gap: 4, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Total Revenue</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#22C55E" }}>{formatMoney(totalRevenue)}</span>
          </div>
          <div className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "16px 18px", gap: 4, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Total Cost</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#EF4444" }}>{formatMoney(totalCost)}</span>
          </div>
          <div className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "16px 18px", gap: 4, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Gross Profit</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: totalProfit >= 0 ? "#22C55E" : "#EF4444" }}>{formatMoney(totalProfit)}</span>
          </div>
          <div className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "16px 18px", gap: 4, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Margin</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: margin >= 0 ? "#22C55E" : "#EF4444" }}>{margin}%</span>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            <div className="relative" style={{ width: 32, height: 32 }}>
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
              <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
            </div>
            <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading...</span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <span style={{ fontSize: 14, color: "#6B6B70" }}>No user data found</span>
        </div>
      ) : (
        <div style={{ borderRadius: 14, backgroundColor: "#16161A", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E1E22" }}>
                  {["Email", "Total Revenue", "Sub Revenue", "Purchase Revenue", "Videos", "Credits", "Cost", "Gross Profit"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#6B6B70", textAlign: "left", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} style={{ borderBottom: "1px solid #1E1E22" }}>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "#FAFAF9", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: u.totalRevenueCents > 0 ? "#22C55E" : "#4A4A50" }}>
                      {u.totalRevenueCents > 0 ? formatMoney(u.totalRevenueCents) : "-"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: u.subRevenueCents > 0 ? "#3B82F6" : "#4A4A50" }}>
                      {u.subRevenueCents > 0 ? formatMoney(u.subRevenueCents) : "-"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: u.purchaseRevenueCents > 0 ? "#A855F7" : "#4A4A50" }}>
                      {u.purchaseRevenueCents > 0 ? formatMoney(u.purchaseRevenueCents) : "-"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: u.videoCount > 0 ? "#E8A838" : "#4A4A50" }}>
                      {u.videoCount}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: u.creditsConsumed > 0 ? "#F97316" : "#4A4A50" }}>
                      {u.creditsConsumed > 0 ? u.creditsConsumed.toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: u.costCents > 0 ? "#EF4444" : "#4A4A50" }}>
                      {u.costCents > 0 ? formatMoney(u.costCents) : "-"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: u.grossProfitCents >= 0 ? "#22C55E" : "#EF4444" }}>
                      {u.grossProfitCents >= 0 ? formatMoney(u.grossProfitCents) : `-${formatMoney(Math.abs(u.grossProfitCents))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
