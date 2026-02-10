"use client";

import { trpc } from "@/lib/trpc";
import {
  Activity,
  Database,
  Video,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  color: string;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        borderRadius: 14,
        backgroundColor: "#16161A",
        padding: "16px 18px",
        gap: 8,
        flex: 1,
        minWidth: 140,
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6B70" }}>{label}</span>
        <div
          className="flex items-center justify-center"
          style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${color}15` }}
        >
          <Icon style={{ width: 14, height: 14, color }} strokeWidth={1.5} />
        </div>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>{value}</span>
      {sub && <span style={{ fontSize: 11, fontWeight: 400, color: "#6B6B70" }}>{sub}</span>}
    </div>
  );
}

function HealthDot({ healthy }: { healthy: boolean }) {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: healthy ? "#22C55E" : "#EF4444",
        boxShadow: healthy ? "0 0 8px #22C55E60" : "0 0 8px #EF444460",
      }}
    />
  );
}

function HealthCard({ name, healthy, icon: Icon }: { name: string; healthy: boolean; icon: any }) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 14,
        borderRadius: 14,
        backgroundColor: "#16161A",
        padding: "16px 20px",
        flex: 1,
        minWidth: 160,
        border: `1px solid ${healthy ? "#22C55E20" : "#EF444430"}`,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: healthy ? "#22C55E10" : "#EF444410",
        }}
      >
        <Icon style={{ width: 18, height: 18, color: healthy ? "#22C55E" : "#EF4444" }} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col" style={{ gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#FAFAF9" }}>{name}</span>
        <div className="flex items-center" style={{ gap: 6 }}>
          <HealthDot healthy={healthy} />
          <span style={{ fontSize: 12, color: healthy ? "#22C55E" : "#EF4444" }}>
            {healthy ? "Healthy" : "Unreachable"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 15, fontWeight: 600, color: "#FAFAF9", margin: 0 }}>{children}</h2>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MonitoringPage() {
  const { data, isLoading, error, refetch, isFetching } = trpc.admin.getMonitoringData.useQuery(
    undefined,
    { refetchInterval: 60_000 }
  );

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
            <div
              className="absolute inset-0 animate-spin rounded-full"
              style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }}
            />
          </div>
          <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading monitoring...</span>
        </div>
      </div>
    );
  }

  const { healthChecks, videoStats, creditStats, stuckVideos, recentFailures, totals, eventStats } = data;

  return (
    <div
      className="flex w-full flex-1 flex-col"
      style={{ padding: "20px", gap: 28, maxWidth: 1200, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: 12 }}>
          <Activity style={{ width: 22, height: 22, color: "#E8A838" }} strokeWidth={1.5} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#FAFAF9", margin: 0 }}>
            Infrastructure Monitoring
          </h1>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <span style={{ fontSize: 12, color: "#6B6B70" }}>
            Last check: {formatTime(data.checkedAt)}
          </span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center transition-colors"
            style={{
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              backgroundColor: "#1E1E22",
              border: "1px solid #252530",
              color: "#FAFAF9",
              fontSize: 13,
              fontWeight: 500,
              cursor: isFetching ? "default" : "pointer",
              opacity: isFetching ? 0.6 : 1,
            }}
          >
            <RefreshCw
              style={{ width: 14, height: 14 }}
              strokeWidth={1.5}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Service Health */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        <SectionTitle>Service Health</SectionTitle>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <HealthCard name="Supabase DB" healthy={healthChecks.supabase} icon={Database} />
          <HealthCard name="Kling AI API" healthy={healthChecks.kling} icon={Video} />
          <HealthCard name="Stripe API" healthy={healthChecks.stripe} icon={CreditCard} />
        </div>
      </div>

      {/* Stuck Videos Warning */}
      {stuckVideos.length > 0 && (
        <div
          className="flex flex-col"
          style={{
            gap: 12,
            borderRadius: 14,
            backgroundColor: "#E8A83808",
            border: "1px solid #E8A83830",
            padding: "16px 20px",
          }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <AlertTriangle style={{ width: 16, height: 16, color: "#E8A838" }} strokeWidth={1.5} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#E8A838" }}>
              {stuckVideos.length} Stuck Video{stuckVideos.length > 1 ? "s" : ""} (generating &gt; 30 min)
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Email", "Mode", "Duration", "Stuck For", "Created"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "6px 10px",
                        fontWeight: 500,
                        color: "#6B6B70",
                        borderBottom: "1px solid #252530",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stuckVideos.map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: "6px 10px", color: "#FAFAF9" }}>{v.email || v.user_id.slice(0, 8)}</td>
                    <td style={{ padding: "6px 10px", color: "#9898A4" }}>{v.mode}</td>
                    <td style={{ padding: "6px 10px", color: "#9898A4" }}>{v.duration}s</td>
                    <td style={{ padding: "6px 10px", color: "#E8A838", fontWeight: 600 }}>{v.minutesStuck} min</td>
                    <td style={{ padding: "6px 10px", color: "#6B6B70" }}>{formatTime(v.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Generation - 24h */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        <SectionTitle>Video Generation (24h)</SectionTitle>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <StatCard label="Total" value={videoStats.last24h.total} icon={Video} color="#3B82F6" />
          <StatCard
            label="Success Rate"
            value={`${videoStats.last24h.successRate}%`}
            sub={`${videoStats.last24h.completed} completed`}
            icon={CheckCircle2}
            color="#22C55E"
          />
          <StatCard
            label="Fail Rate"
            value={`${videoStats.last24h.failRate}%`}
            sub={`${videoStats.last24h.failed} failed`}
            icon={XCircle}
            color="#EF4444"
          />
          <StatCard
            label="In Queue"
            value={videoStats.last24h.pending + videoStats.last24h.generating}
            sub={`${videoStats.last24h.pending} pending · ${videoStats.last24h.generating} generating`}
            icon={Clock}
            color="#E8A838"
          />
        </div>
      </div>

      {/* Video Generation - 7d */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        <SectionTitle>Video Generation (7d)</SectionTitle>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <StatCard label="Total" value={videoStats.last7d.total} icon={Video} color="#3B82F6" />
          <StatCard
            label="Success Rate"
            value={`${videoStats.last7d.successRate}%`}
            sub={`${videoStats.last7d.completed} completed`}
            icon={CheckCircle2}
            color="#22C55E"
          />
          <StatCard
            label="Fail Rate"
            value={`${videoStats.last7d.failRate}%`}
            sub={`${videoStats.last7d.failed} failed`}
            icon={XCircle}
            color="#EF4444"
          />
          <StatCard
            label="In Queue"
            value={videoStats.last7d.pending + videoStats.last7d.generating}
            sub={`${videoStats.last7d.pending} pending · ${videoStats.last7d.generating} generating`}
            icon={Clock}
            color="#E8A838"
          />
        </div>
      </div>

      {/* Credit Activity - 7d */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        <SectionTitle>Credit Activity (7d)</SectionTitle>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          {Object.entries(creditStats).length > 0 ? (
            Object.entries(creditStats).map(([type, count]) => (
              <StatCard
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                value={count}
                icon={CreditCard}
                color={
                  type === "purchase" || type === "subscription"
                    ? "#22C55E"
                    : type === "deduction"
                      ? "#3B82F6"
                      : "#9898A4"
                }
              />
            ))
          ) : (
            <span style={{ fontSize: 13, color: "#6B6B70" }}>No credit activity in last 7 days</span>
          )}
        </div>
      </div>

      {/* Auth & System Events (24h) */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        <SectionTitle>Events (24h)</SectionTitle>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <StatCard
            label="OTP Sent"
            value={eventStats.last24h["otp_send_ok"] ?? 0}
            icon={CheckCircle2}
            color="#22C55E"
          />
          <StatCard
            label="OTP Send Fail"
            value={eventStats.last24h["otp_send_fail"] ?? 0}
            icon={XCircle}
            color="#EF4444"
          />
          <StatCard
            label="OTP Verified"
            value={eventStats.last24h["otp_verify_ok"] ?? 0}
            icon={CheckCircle2}
            color="#22C55E"
          />
          <StatCard
            label="OTP Verify Fail"
            value={eventStats.last24h["otp_verify_fail"] ?? 0}
            icon={XCircle}
            color="#EF4444"
          />
          {(eventStats.last24h["upload_fail"] ?? 0) > 0 && (
            <StatCard
              label="Upload Fail"
              value={eventStats.last24h["upload_fail"]}
              icon={XCircle}
              color="#EF4444"
            />
          )}
          {(eventStats.last24h["video_generate_fail"] ?? 0) > 0 && (
            <StatCard
              label="Generate Fail"
              value={eventStats.last24h["video_generate_fail"]}
              icon={XCircle}
              color="#EF4444"
            />
          )}
        </div>
      </div>

      {/* Recent Events Log */}
      {eventStats.recentEvents.length > 0 && (
        <div className="flex flex-col" style={{ gap: 12 }}>
          <SectionTitle>Recent Event Log (24h)</SectionTitle>
          <div style={{ borderRadius: 14, backgroundColor: "#16161A", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Event", "Email", "Detail", "Time"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 500,
                          color: "#6B6B70",
                          borderBottom: "1px solid #252530",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventStats.recentEvents.map((e: any, i: number) => {
                    const isFail = e.event.includes("fail");
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #1E1E22" }}>
                        <td style={{ padding: "8px 12px" }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              padding: "2px 8px",
                              borderRadius: 6,
                              backgroundColor: isFail ? "#EF444415" : "#22C55E15",
                              color: isFail ? "#EF4444" : "#22C55E",
                            }}
                          >
                            {e.event}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", color: "#FAFAF9" }}>{e.email || "—"}</td>
                        <td
                          style={{
                            padding: "8px 12px",
                            color: "#6B6B70",
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {e.metadata?.error || "—"}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#6B6B70", whiteSpace: "nowrap" }}>
                          {formatTime(e.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Overall */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        <SectionTitle>Overall</SectionTitle>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <StatCard label="Total Users" value={totals.users.toLocaleString()} icon={Database} color="#A855F7" />
          <StatCard label="Total Videos" value={totals.videos.toLocaleString()} icon={Video} color="#3B82F6" />
        </div>
      </div>

      {/* Recent Failures */}
      {recentFailures.length > 0 && (
        <div className="flex flex-col" style={{ gap: 12 }}>
          <SectionTitle>Recent Failures</SectionTitle>
          <div
            style={{
              borderRadius: 14,
              backgroundColor: "#16161A",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Email", "Mode", "Duration", "Prompt", "Time"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 500,
                          color: "#6B6B70",
                          borderBottom: "1px solid #252530",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentFailures.map((v) => (
                    <tr key={v.id} style={{ borderBottom: "1px solid #1E1E22" }}>
                      <td style={{ padding: "8px 12px", color: "#FAFAF9" }}>
                        {v.email || v.user_id.slice(0, 8)}
                      </td>
                      <td style={{ padding: "8px 12px", color: "#9898A4" }}>{v.mode}</td>
                      <td style={{ padding: "8px 12px", color: "#9898A4" }}>{v.duration}s</td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#6B6B70",
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {v.prompt || "—"}
                      </td>
                      <td style={{ padding: "8px 12px", color: "#6B6B70", whiteSpace: "nowrap" }}>
                        {formatTime(v.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
