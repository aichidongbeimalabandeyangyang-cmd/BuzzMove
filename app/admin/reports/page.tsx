"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, FileText, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default function AdminReportsPage() {
  const [offset, setOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: listData, isLoading: listLoading, error: listError, refetch } = trpc.admin.getReports.useQuery(
    { limit: PAGE_SIZE, offset },
  );

  const { data: reportData, isLoading: reportLoading } = trpc.admin.getReport.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId },
  );

  const generateMutation = trpc.admin.generateReport.useMutation({
    onSuccess(data) {
      setSelectedId(data.id);
      refetch();
    },
  });

  if (listError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center" style={{ gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#EF4444" }}>Access Denied</span>
          <span style={{ fontSize: 14, color: "#6B6B70" }}>{listError.message}</span>
        </div>
      </div>
    );
  }

  // Report Detail View
  if (selectedId) {
    return (
      <div className="flex w-full flex-1 flex-col" style={{ padding: 20, gap: 16, maxWidth: 900, margin: "0 auto" }}>
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center transition-all active:scale-[0.97]"
          style={{ gap: 6, alignSelf: "flex-start" }}
        >
          <ArrowLeft style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6B70" }}>Back to Reports</span>
        </button>

        {reportLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center" style={{ gap: 8 }}>
              <div className="relative" style={{ width: 32, height: 32 }}>
                <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
                <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
              </div>
              <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading report...</span>
            </div>
          </div>
        ) : reportData ? (
          <div
            className="prose prose-invert max-w-none"
            style={{
              borderRadius: 14,
              backgroundColor: "#16161A",
              padding: "24px 28px",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 500, color: "#6B6B70", marginBottom: 16 }}>
              {new Date(reportData.period_start).toLocaleDateString()} — {new Date(reportData.period_end).toLocaleDateString()}
              {" · "}
              {reportData.report_type === "manual" ? "Manual" : "Automated"}
            </div>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9", margin: "24px 0 12px" }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 700, color: "#E8A838", margin: "20px 0 10px" }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9", margin: "16px 0 8px" }}>{children}</h3>,
                p: ({ children }) => <p style={{ fontSize: 14, lineHeight: 1.7, color: "#C4C4C8", margin: "8px 0" }}>{children}</p>,
                strong: ({ children }) => <strong style={{ color: "#FAFAF9", fontWeight: 600 }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: "8px 0" }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: "8px 0" }}>{children}</ol>,
                li: ({ children }) => <li style={{ fontSize: 14, lineHeight: 1.7, color: "#C4C4C8", margin: "4px 0" }}>{children}</li>,
                hr: () => <hr style={{ border: "none", borderTop: "1px solid #252530", margin: "20px 0" }} />,
              }}
            >
              {reportData.report_content}
            </ReactMarkdown>
          </div>
        ) : null}
      </div>
    );
  }

  // Reports List View
  return (
    <div className="flex w-full flex-1 flex-col" style={{ padding: 20, gap: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: 12 }}>
          <Link
            href="/admin"
            className="flex items-center transition-all active:scale-[0.97]"
            style={{ gap: 6 }}
          >
            <ArrowLeft style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Analytics Reports</h1>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="flex items-center transition-all active:scale-[0.97] disabled:opacity-50"
          style={{ gap: 6, borderRadius: 10, background: "linear-gradient(135deg, #F0C060, #E8A838)", padding: "8px 16px" }}
        >
          <RefreshCw
            style={{ width: 14, height: 14, color: "#0B0B0E" }}
            strokeWidth={1.5}
            className={generateMutation.isPending ? "animate-spin" : ""}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0B0B0E" }}>
            {generateMutation.isPending ? "Generating..." : "Generate Now"}
          </span>
        </button>
      </div>

      {listLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            <div className="relative" style={{ width: 32, height: 32 }}>
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
              <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
            </div>
            <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading reports...</span>
          </div>
        </div>
      ) : !listData?.reports.length ? (
        <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 12, padding: "60px 0" }}>
          <FileText style={{ width: 40, height: 40, color: "#252530" }} strokeWidth={1} />
          <span style={{ fontSize: 15, fontWeight: 500, color: "#6B6B70" }}>No reports yet</span>
          <span style={{ fontSize: 13, color: "#4A4A50" }}>Click "Generate Now" to create your first report, or wait for the next scheduled run.</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col" style={{ gap: 8 }}>
            {listData.reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedId(report.id)}
                className="flex w-full items-center justify-between transition-all active:scale-[0.98]"
                style={{ borderRadius: 14, backgroundColor: "#16161A", padding: "14px 18px" }}
              >
                <div className="flex flex-col" style={{ gap: 4, alignItems: "flex-start" }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <FileText style={{ width: 14, height: 14, color: "#E8A838" }} strokeWidth={1.5} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9" }}>
                      {new Date(report.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        borderRadius: 6, padding: "2px 8px",
                        color: report.report_type === "manual" ? "#A855F7" : "#22C55E",
                        backgroundColor: report.report_type === "manual" ? "#A855F720" : "#22C55E20",
                      }}
                    >
                      {report.report_type === "manual" ? "MANUAL" : "AUTO"}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#6B6B70" }}>
                    {new Date(report.period_start).toLocaleDateString()} — {new Date(report.period_end).toLocaleDateString()}
                  </span>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: "#4A4A50" }} strokeWidth={1.5} />
              </button>
            ))}
          </div>

          {/* Pagination */}
          {listData.total > PAGE_SIZE && (
            <div className="flex items-center justify-center" style={{ gap: 12 }}>
              <button
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0}
                className="flex items-center justify-center disabled:opacity-30"
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}
              >
                <ChevronLeft style={{ width: 16, height: 16, color: "#FAFAF9" }} strokeWidth={1.5} />
              </button>
              <span style={{ fontSize: 13, color: "#6B6B70" }}>
                {offset + 1}–{Math.min(offset + PAGE_SIZE, listData.total)} of {listData.total}
              </span>
              <button
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= listData.total}
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
