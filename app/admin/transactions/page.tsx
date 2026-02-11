"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PAGE_SIZE = 30;

function formatMoney(cents: number | null) {
  if (!cents) return "-";
  return `$${(cents / 100).toFixed(2)}`;
}

export default function TransactionsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = trpc.admin.getTransactions.useQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

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

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex w-full flex-1 flex-col" style={{ padding: 20, gap: 20, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: 12 }}>
          <Link href="/admin" className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Transactions</h1>
          <span style={{ fontSize: 13, color: "#6B6B70" }}>{total} total</span>
        </div>
      </div>

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
      ) : transactions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <span style={{ fontSize: 14, color: "#6B6B70" }}>No transactions found</span>
        </div>
      ) : (
        <>
          <div style={{ borderRadius: 14, backgroundColor: "#16161A", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E1E22" }}>
                    {["Time", "Email", "Type", "Product", "Amount", "Credits", "Stripe ID"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#6B6B70", textAlign: "left", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: "1px solid #1E1E22" }}>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#FAFAF9", whiteSpace: "nowrap" }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#FAFAF9", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tx.email}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px",
                          color: tx.type === "purchase" ? "#22C55E" : "#A855F7",
                          backgroundColor: tx.type === "purchase" ? "#22C55E15" : "#A855F715",
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#6B6B70" }}>
                        {tx.description ?? "-"}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: tx.priceCents ? "#22C55E" : "#4A4A50" }}>
                        {formatMoney(tx.priceCents)}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#E8A838" }}>
                        +{tx.amount}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 10, color: "#4A4A50", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tx.stripePaymentId ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center" style={{ gap: 12 }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center justify-center disabled:opacity-30"
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}
              >
                <ChevronLeft style={{ width: 16, height: 16, color: "#FAFAF9" }} strokeWidth={1.5} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6B6B70" }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center justify-center disabled:opacity-30"
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}
              >
                <ChevronRight style={{ width: 16, height: 16, color: "#FAFAF9" }} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
