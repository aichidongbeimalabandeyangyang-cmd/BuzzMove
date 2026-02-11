"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, Clock, BarChart3, TrendingUp, ChevronDown } from "lucide-react";

const PAGE_SIZE = 10;

const REPORT_TYPE_LABELS: Record<string, string> = {
  half_day: "半日报告",
  daily: "日报",
  manual: "手动",
};

const REPORT_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  half_day: { color: "#3B82F6", bg: "#3B82F620" },
  daily: { color: "#22C55E", bg: "#22C55E20" },
  manual: { color: "#A855F7", bg: "#A855F720" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

/** Extract first meaningful heading from HTML or markdown content as a title */
function extractTitle(content: string): string {
  // Try HTML heading first
  const htmlMatch = content.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
  if (htmlMatch) {
    const cleaned = htmlMatch[1].replace(/<[^>]+>/g, "").trim();
    if (cleaned.length > 4) return cleaned.slice(0, 60) + (cleaned.length > 60 ? "..." : "");
  }
  // Fallback: markdown heading
  const lines = content.split("\n");
  for (const line of lines) {
    const cleaned = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/<[^>]+>/g, "").trim();
    if (cleaned.length > 4) return cleaned.slice(0, 60) + (cleaned.length > 60 ? "..." : "");
  }
  return "分析报告";
}

/** Extract executive summary from HTML or markdown content */
function extractSummary(content: string): string {
  // Try to find summary section in HTML (look for heading containing 摘要/summary then grab next <p>)
  const summaryMatch = content.match(/<h[23][^>]*>[^<]*(摘要|summary|概述|总结)[^<]*<\/h[23]>\s*([\s\S]*?)(?=<h[23]|$)/i);
  if (summaryMatch) {
    const sectionHtml = summaryMatch[2];
    const text = sectionHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text.length > 10) return text.slice(0, 300) + (text.length > 300 ? "..." : "");
  }

  // Fallback: first <p> tag content
  const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (pMatch) {
    const text = pMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 10) return text.slice(0, 300) + (text.length > 300 ? "..." : "");
  }

  // Fallback: markdown style
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.replace(/<[^>]+>/g, "").replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
    if (trimmed.length >= 20 && !trimmed.startsWith("#")) {
      return trimmed.slice(0, 300) + (trimmed.length > 300 ? "..." : "");
    }
  }
  return "";
}

type FilterType = "all" | "half_day" | "daily" | "manual";

export default function AdminReportsPage() {
  const [offset, setOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);

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
      setShowGenerateMenu(false);
      refetch();
    },
  });

  // Filter reports client-side
  const filteredReports = (listData?.reports ?? []).filter((r: any) => {
    if (filter === "all") return true;
    return r.report_type === filter;
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
            <div className="flex items-center" style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70", marginBottom: 20, gap: 8 }}>
              <span
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                  borderRadius: 6, padding: "3px 8px",
                  color: REPORT_TYPE_COLORS[reportData.report_type]?.color ?? "#6B6B70",
                  backgroundColor: REPORT_TYPE_COLORS[reportData.report_type]?.bg ?? "#25253020",
                }}
              >
                {REPORT_TYPE_LABELS[reportData.report_type] ?? reportData.report_type}
              </span>
              <span>
                {formatDate(reportData.period_start)} — {formatDate(reportData.period_end)}
              </span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: reportData.report_content }} />
          </div>
        ) : null}
      </div>
    );
  }

  // ============ Reports List View (Cards) ============
  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "daily", label: "日报" },
    { key: "half_day", label: "半日报告" },
    { key: "manual", label: "手动" },
  ];

  return (
    <div className="flex w-full flex-1 flex-col overflow-y-auto" style={{ padding: 20, gap: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>分析报告</h1>
        <div className="relative">
          <button
            onClick={() => setShowGenerateMenu(!showGenerateMenu)}
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
            {!generateMutation.isPending && (
              <ChevronDown style={{ width: 14, height: 14, color: "#0B0B0E" }} strokeWidth={1.5} />
            )}
          </button>
          {showGenerateMenu && !generateMutation.isPending && (
            <div
              style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 50,
                borderRadius: 12, backgroundColor: "#1E1E24", border: "1px solid #2A2A34",
                padding: 4, minWidth: 160, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <button
                onClick={() => generateMutation.mutate({ type: "daily" })}
                className="flex w-full items-center transition-all"
                style={{ gap: 8, padding: "10px 12px", borderRadius: 8, fontSize: 13, color: "#FAFAF9", fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#252530")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <TrendingUp style={{ width: 14, height: 14, color: "#22C55E" }} strokeWidth={1.5} />
                日报（24h + 7日趋势）
              </button>
              <button
                onClick={() => generateMutation.mutate({ type: "half_day" })}
                className="flex w-full items-center transition-all"
                style={{ gap: 8, padding: "10px 12px", borderRadius: 8, fontSize: 13, color: "#FAFAF9", fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#252530")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Clock style={{ width: 14, height: 14, color: "#3B82F6" }} strokeWidth={1.5} />
                半日报告（12h 快照）
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center" style={{ gap: 4 }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setOffset(0); }}
            className="transition-all"
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: filter === tab.key ? "#FAFAF9" : "#6B6B70",
              backgroundColor: filter === tab.key ? "#252530" : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
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
      ) : !filteredReports.length ? (
        <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 12, padding: "60px 0" }}>
          <BarChart3 style={{ width: 40, height: 40, color: "#252530" }} strokeWidth={1} />
          <span style={{ fontSize: 15, fontWeight: 500, color: "#6B6B70" }}>暂无报告</span>
          <span style={{ fontSize: 13, color: "#4A4A50" }}>点击「立即生成」创建第一篇报告，或等待下次自动生成。</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col" style={{ gap: 16 }}>
            {filteredReports.map((report: any) => {
              const title = report.report_content ? extractTitle(report.report_content) : "分析报告";
              const summary = report.report_content ? extractSummary(report.report_content) : "";
              const typeColors = REPORT_TYPE_COLORS[report.report_type] ?? { color: "#6B6B70", bg: "#25253020" };

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedId(report.id)}
                  className="flex w-full flex-col transition-all active:scale-[0.98]"
                  style={{
                    borderRadius: 18,
                    backgroundColor: "#16161A",
                    padding: "24px 24px 20px",
                    gap: 16,
                    border: "1px solid #1E1E24",
                    textAlign: "left",
                    minHeight: 180,
                  }}
                >
                  {/* Top row: badge + date range */}
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        borderRadius: 6, padding: "3px 8px",
                        color: typeColors.color,
                        backgroundColor: typeColors.bg,
                      }}
                    >
                      {REPORT_TYPE_LABELS[report.report_type] ?? report.report_type}
                    </span>
                    <span style={{ fontSize: 12, color: "#4A4A50" }}>
                      {formatDate(report.created_at)} {formatTime(report.created_at)}
                    </span>
                  </div>

                  {/* Title + period */}
                  <div className="flex w-full items-start justify-between" style={{ gap: 12 }}>
                    <div className="flex flex-col" style={{ gap: 6, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF9", lineHeight: 1.3 }}>
                        {title}
                      </span>
                      <span style={{ fontSize: 13, color: "#6B6B70" }}>
                        {formatDate(report.period_start)} — {formatDate(report.period_end)}
                      </span>
                    </div>
                    <ChevronRight style={{ width: 20, height: 20, color: "#4A4A50", flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
                  </div>

                  {/* Executive Summary preview */}
                  {summary && (
                    <p style={{
                      fontSize: 13, lineHeight: 1.7, color: "#7A7A82", margin: 0,
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {summary}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {listData && listData.total > PAGE_SIZE && (
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
