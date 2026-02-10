"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, FileText, RefreshCw, ChevronLeft, ChevronRight, Clock, BarChart3, TrendingUp, Calendar } from "lucide-react";

const PAGE_SIZE = 10;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

/** Extract first meaningful line from markdown as a title */
function extractTitle(content: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const cleaned = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
    if (cleaned.length > 4) return cleaned.slice(0, 60) + (cleaned.length > 60 ? "..." : "");
  }
  return "分析报告";
}

/** Extract a preview snippet (skip title, get first paragraph) */
function extractPreview(content: string): string {
  const lines = content.split("\n");
  let skippedTitle = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!skippedTitle && trimmed.startsWith("#")) { skippedTitle = true; continue; }
    if (trimmed.length > 20) {
      const clean = trimmed.replace(/\*\*/g, "").replace(/^[-*]\s*/, "");
      return clean.slice(0, 120) + (clean.length > 120 ? "..." : "");
    }
  }
  return "";
}

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

  // ============ Report Detail View ============
  if (selectedId) {
    return (
      <div className="flex w-full flex-1 flex-col overflow-y-auto" style={{ padding: 20, gap: 16, maxWidth: 900, margin: "0 auto" }}>
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center transition-all active:scale-[0.97]"
          style={{ gap: 6, alignSelf: "flex-start" }}
        >
          <ArrowLeft style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6B70" }}>返回报告列表</span>
        </button>

        {reportLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center" style={{ gap: 8 }}>
              <div className="relative" style={{ width: 32, height: 32 }}>
                <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
                <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
              </div>
              <span style={{ fontSize: 13, color: "#6B6B70" }}>加载报告中...</span>
            </div>
          </div>
        ) : reportData ? (
          <div style={{ borderRadius: 16, backgroundColor: "#16161A", padding: "28px 32px" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70", marginBottom: 20 }}>
              {formatDate(reportData.period_start)} — {formatDate(reportData.period_end)}
              {" · "}
              {reportData.report_type === "manual" ? "手动生成" : "自动生成"}
            </div>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: 24, fontWeight: 700, color: "#FAFAF9", margin: "28px 0 14px" }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 700, color: "#E8A838", margin: "24px 0 12px" }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9", margin: "18px 0 8px" }}>{children}</h3>,
                p: ({ children }) => <p style={{ fontSize: 14, lineHeight: 1.8, color: "#C4C4C8", margin: "10px 0" }}>{children}</p>,
                strong: ({ children }) => <strong style={{ color: "#FAFAF9", fontWeight: 600 }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: "10px 0" }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: "10px 0" }}>{children}</ol>,
                li: ({ children }) => <li style={{ fontSize: 14, lineHeight: 1.8, color: "#C4C4C8", margin: "4px 0" }}>{children}</li>,
                hr: () => <hr style={{ border: "none", borderTop: "1px solid #252530", margin: "24px 0" }} />,
              }}
            >
              {reportData.report_content}
            </ReactMarkdown>
          </div>
        ) : null}
      </div>
    );
  }

  // ============ Reports List View (Cards) ============
  return (
    <div className="flex w-full flex-1 flex-col overflow-y-auto" style={{ padding: 20, gap: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>分析报告</h1>
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
            {generateMutation.isPending ? "生成中..." : "立即生成"}
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
            <span style={{ fontSize: 13, color: "#6B6B70" }}>加载中...</span>
          </div>
        </div>
      ) : !listData?.reports.length ? (
        <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 12, padding: "60px 0" }}>
          <BarChart3 style={{ width: 40, height: 40, color: "#252530" }} strokeWidth={1} />
          <span style={{ fontSize: 15, fontWeight: 500, color: "#6B6B70" }}>暂无报告</span>
          <span style={{ fontSize: 13, color: "#4A4A50" }}>点击「立即生成」创建第一篇报告，或等待下次自动生成。</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col" style={{ gap: 12 }}>
            {listData.reports.map((report: any) => {
              const title = report.report_content ? extractTitle(report.report_content) : "分析报告";
              const preview = report.report_content ? extractPreview(report.report_content) : "";

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedId(report.id)}
                  className="flex w-full flex-col transition-all active:scale-[0.98]"
                  style={{
                    borderRadius: 16,
                    backgroundColor: "#16161A",
                    padding: "18px 20px",
                    gap: 12,
                    border: "1px solid #1E1E24",
                    textAlign: "left",
                  }}
                >
                  {/* Card Header */}
                  <div className="flex w-full items-start justify-between">
                    <div className="flex flex-col" style={{ gap: 6, flex: 1, minWidth: 0 }}>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <span
                          style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                            borderRadius: 6, padding: "3px 8px",
                            color: report.report_type === "manual" ? "#A855F7" : "#22C55E",
                            backgroundColor: report.report_type === "manual" ? "#A855F720" : "#22C55E20",
                          }}
                        >
                          {report.report_type === "manual" ? "手动" : "自动"}
                        </span>
                        <div className="flex items-center" style={{ gap: 4 }}>
                          <Calendar style={{ width: 11, height: 11, color: "#4A4A50" }} strokeWidth={1.5} />
                          <span style={{ fontSize: 11, color: "#4A4A50" }}>
                            {formatDate(report.period_start)} — {formatDate(report.period_end)}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 600, color: "#FAFAF9" }}>
                        {title}
                      </span>
                    </div>
                    <ChevronRight style={{ width: 18, height: 18, color: "#4A4A50", flexShrink: 0, marginTop: 4 }} strokeWidth={1.5} />
                  </div>

                  {/* Preview Snippet */}
                  {preview && (
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "#6B6B70", margin: 0 }}>
                      {preview}
                    </p>
                  )}

                  {/* Card Footer */}
                  <div className="flex items-center" style={{ gap: 12 }}>
                    <div className="flex items-center" style={{ gap: 4 }}>
                      <Clock style={{ width: 11, height: 11, color: "#4A4A50" }} strokeWidth={1.5} />
                      <span style={{ fontSize: 11, color: "#4A4A50" }}>
                        {formatDate(report.created_at)} {formatTime(report.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
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
                {offset + 1}–{Math.min(offset + PAGE_SIZE, listData.total)} / {listData.total}
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
