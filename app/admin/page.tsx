"use client";

import { trpc } from "@/lib/trpc";
import { Users, Video, DollarSign, TrendingUp, UserPlus, CreditCard } from "lucide-react";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <div className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "16px 18px", gap: 8, flex: 1, minWidth: 140 }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>{label}</span>
        <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${color}15` }}>
          <Icon style={{ width: 14, height: 14, color }} strokeWidth={1.5} />
        </div>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>{value}</span>
      {sub && <span style={{ fontSize: 11, fontWeight: 400, color: "#6B6B70" }}>{sub}</span>}
    </div>
  );
}

export default function AdminPage() {
  const { data, isLoading, error } = trpc.admin.getDailyStats.useQuery();

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

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center" style={{ gap: 8 }}>
          <div className="relative" style={{ width: 32, height: 32 }}>
            <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
            <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
          </div>
          <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const today = data.days[data.days.length - 1];
  const totals = data.totals;

  return (
    <div className="flex w-full flex-1 flex-col" style={{ padding: "20px", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Admin Dashboard</h1>
        <span style={{ fontSize: 12, fontWeight: 400, color: "#6B6B70" }}>Last 30 days</span>
      </div>

      {/* Today Stats */}
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6B70", letterSpacing: 1 }}>TODAY</span>
        <div className="flex flex-wrap" style={{ gap: 10, marginTop: 8 }}>
          <StatCard label="New Users" value={today.newUsers} icon={UserPlus} color="#3B82F6" />
          <StatCard label="Active Users" value={today.activeUsers} icon={Users} color="#22C55E" />
          <StatCard label="Videos" value={today.videoCount} icon={Video} color="#E8A838" />
          <StatCard label="Paid Users" value={today.paidUsers} icon={CreditCard} color="#A855F7" />
          <StatCard label="Revenue" value={formatMoney(today.revenueCents)} icon={DollarSign} color="#22C55E" />
        </div>
      </div>

      {/* 30-day Totals */}
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6B70", letterSpacing: 1 }}>30-DAY TOTALS</span>
        <div className="flex flex-wrap" style={{ gap: 10, marginTop: 8 }}>
          <StatCard label="New Users" value={totals.newUsers} icon={UserPlus} color="#3B82F6" />
          <StatCard label="Active Users" value={totals.activeUsers} icon={Users} color="#22C55E" />
          <StatCard label="Videos" value={totals.videoCount} icon={Video} color="#E8A838" />
          <StatCard label="Paid Users" value={totals.paidUsers} icon={CreditCard} color="#A855F7" />
          <StatCard label="Revenue" value={formatMoney(totals.revenueCents)} icon={DollarSign} color="#22C55E" />
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6B70", letterSpacing: 1 }}>DAILY BREAKDOWN</span>
        <div style={{ marginTop: 8, borderRadius: 14, backgroundColor: "#16161A", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E1E22" }}>
                  {["Date", "New Users", "Active", "Videos", "Paid", "Revenue", "Breakdown"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#6B6B70", textAlign: "left", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...data.days].reverse().map((day) => (
                  <tr key={day.date} style={{ borderBottom: "1px solid #1E1E22" }}>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, color: "#FAFAF9", whiteSpace: "nowrap" }}>
                      {day.date}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: day.newUsers > 0 ? "#3B82F6" : "#4A4A50" }}>
                      {day.newUsers}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: day.activeUsers > 0 ? "#22C55E" : "#4A4A50" }}>
                      {day.activeUsers}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: day.videoCount > 0 ? "#E8A838" : "#4A4A50" }}>
                      {day.videoCount}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: day.paidUsers > 0 ? "#A855F7" : "#4A4A50" }}>
                      {day.paidUsers}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: day.revenueCents > 0 ? "#22C55E" : "#4A4A50" }}>
                      {day.revenueCents > 0 ? formatMoney(day.revenueCents) : "-"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#6B6B70" }}>
                      {Object.entries(day.packBreakdown).map(([k, v]) => `${k}: ${v}`).join(", ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
