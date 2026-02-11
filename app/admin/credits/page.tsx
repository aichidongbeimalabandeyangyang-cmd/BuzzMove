"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CreditsPage() {
  const { data, isLoading, error } = trpc.admin.getPaidUsers.useQuery();

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
  const totalBalance = users.reduce((s, u) => s + u.balance, 0);
  const totalPurchased = users.reduce((s, u) => s + u.totalCredits, 0);

  return (
    <div className="flex w-full flex-1 flex-col" style={{ padding: 20, gap: 20, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: 12 }}>
          <Link href="/admin" className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Paid Users Credits</h1>
          <span style={{ fontSize: 13, color: "#6B6B70" }}>{users.length} users</span>
        </div>
      </div>

      {/* Summary */}
      {!isLoading && users.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: 10 }}>
          <div className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "16px 18px", gap: 4, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Total Purchased</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#E8A838" }}>{totalPurchased.toLocaleString()}</span>
          </div>
          <div className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "16px 18px", gap: 4, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Total Balance</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#22C55E" }}>{totalBalance.toLocaleString()}</span>
          </div>
          <div className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "16px 18px", gap: 4, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>Total Used</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>{(totalPurchased - totalBalance).toLocaleString()}</span>
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
          <span style={{ fontSize: 14, color: "#6B6B70" }}>No paid users found</span>
        </div>
      ) : (
        <div style={{ borderRadius: 14, backgroundColor: "#16161A", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E1E22" }}>
                  {["Email", "Plan", "Total Purchased", "Balance", "Used", "Usage %"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#6B6B70", textAlign: "left", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const used = u.totalCredits - u.balance;
                  const usagePct = u.totalCredits > 0 ? Math.round((used / u.totalCredits) * 100) : 0;
                  return (
                    <tr key={u.email} style={{ borderBottom: "1px solid #1E1E22" }}>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#FAFAF9", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.email}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px",
                          color: u.plan === "free" ? "#6B6B70" : "#A855F7",
                          backgroundColor: u.plan === "free" ? "#6B6B7015" : "#A855F715",
                        }}>
                          {u.plan}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#E8A838" }}>
                        {u.totalCredits.toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: u.balance > 0 ? "#22C55E" : "#EF4444" }}>
                        {u.balance.toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#FAFAF9" }}>
                        {used.toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div className="flex items-center" style={{ gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "#252530", maxWidth: 80 }}>
                            <div style={{
                              width: `${Math.min(usagePct, 100)}%`,
                              height: "100%",
                              borderRadius: 3,
                              backgroundColor: usagePct >= 90 ? "#EF4444" : usagePct >= 60 ? "#E8A838" : "#22C55E",
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 500, color: "#6B6B70" }}>{usagePct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
