"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryHistory } from "@/lib/hooks/use-evidence";
import { useAuthStore } from "@/stores/auth-store";
import api from "@/lib/api";
import type { DashboardStats, QueryHistoryItem } from "@/lib/types";
import { Card, Eyebrow, Badge, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";
import Link from "next/link";

function useStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/dashboard/stats");
      return data as DashboardStats;
    },
  });
}

function StatBig({ n, l, sub, t, tone }: { n: string; l: string; sub: string; t: string; tone: string }) {
  const colors: Record<string, string> = {
    forest: "var(--forest)",
    moss: "var(--moss)",
    sand: "var(--sand)",
    clay: "var(--clay)",
  };
  return (
    <Card>
      <div className="row justify-between" style={{ marginBottom: 14 }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[tone] || "var(--forest)" }} />
      </div>
      <div className="serif" style={{ fontSize: 38, letterSpacing: "-0.025em", lineHeight: 1 }}>{n}</div>
      <div className="row justify-between items-center" style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--rule-soft)" }}>
        <span className="text-xs text-soft mono">{sub}</span>
        <span className="text-xs mono" style={{ color: "var(--forest)" }}>{t}</span>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats } = useStats();
  const { data: history } = useQueryHistory(10);
  const user = useAuthStore((s) => s.user);

  const speciesCount = stats?.total_species?.toLocaleString() ?? "56,198";
  const papersCount = stats?.total_papers?.toLocaleString() ?? "17,934";
  const alertCount = stats?.unread_alerts ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="row justify-between items-end" style={{ marginBottom: 32 }}>
        <div>
          <Eyebrow>Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</Eyebrow>
          <h1 className="serif" style={{ fontSize: 40, margin: "8px 0 0", letterSpacing: "-0.02em" }}>
            Your evidence workspace.{" "}
            <span style={{ color: "var(--ink-mute)" }}>+103 papers ingested this week.</span>
          </h1>
        </div>
        <div className="row gap-2">
          <Link href="/evidence" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
            <I.Sparkles size={13} /> Ask the evidence base
          </Link>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatBig n={speciesCount} l="Species indexed" sub="GBIF + IUCN" t="+12 this week" tone="forest" />
        <StatBig n={papersCount} l="Papers in corpus" sub="CORE + OpenAlex" t="+103 this week" tone="moss" />
        <StatBig n="3,891" l="CE interventions" sub="6 categories" t="2 ratings updated" tone="sand" />
        <StatBig n={String(stats?.total_projects ?? 4)} l="Active projects" sub="2 reporting" t={`${alertCount} alerts pending`} tone="clay" />
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Recent queries */}
        <Card pad={false}>
          <div className="row justify-between items-center" style={{ padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
            <div>
              <Eyebrow>Recent queries</Eyebrow>
              <div className="serif" style={{ fontSize: 22, marginTop: 4, letterSpacing: "-0.01em" }}>Your evidence searches</div>
            </div>
            <Link href="/evidence" className="text-sm" style={{ color: "var(--forest)", cursor: "pointer", textDecoration: "none" }}>
              New search <I.ArrowRight size={12} style={{ verticalAlign: -1 }} />
            </Link>
          </div>
          {!history?.length ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <span className="text-sm text-soft">No queries yet. </span>
              <Link href="/evidence" style={{ color: "var(--forest)", fontSize: 13 }}>Search for evidence</Link>
            </div>
          ) : (
            (history as QueryHistoryItem[]).slice(0, 5).map((q, i) => (
              <div key={q.id} style={{
                padding: "16px 24px",
                borderBottom: i < 4 ? "1px solid var(--rule-soft)" : "none",
                cursor: "pointer",
              }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{q.question}</div>
                <div className="row gap-2 items-center">
                  <Badge tone={q.confidence === "strong" ? "strong" : q.confidence === "moderate" ? "moderate" : "weak"} dot>
                    {q.confidence}
                  </Badge>
                  <span className="badge mono">{q.query_type}</span>
                  <span className="text-xs text-soft mono">{(q.latency_ms / 1000).toFixed(1)}s</span>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Right column */}
        <div className="col gap-4">
          {/* Confidence ring */}
          <Card>
            <Eyebrow>Eval gold-set</Eyebrow>
            <div className="row items-center gap-4" style={{ marginTop: 14 }}>
              <div className="bloom-ring" style={{ "--p": "90%" as string, width: 88, height: 88 } as React.CSSProperties}>
                <div className="bloom-inner" style={{ width: 70, height: 70 }}>
                  <div className="serif" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>90<span style={{ fontSize: 14 }}>%</span></div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="serif" style={{ fontSize: 18, lineHeight: 1.2, marginBottom: 4 }}>Confidence above threshold</div>
                <div className="text-xs text-soft mono">CE 80 &middot; Direction 80 &middot; Citations 100 &middot; Confidence 90</div>
              </div>
            </div>
          </Card>

          {/* Alerts */}
          <Card pad={false}>
            <div className="row justify-between items-center" style={{ padding: "20px 24px 12px" }}>
              <Eyebrow>Alerts</Eyebrow>
              <Link href="/alerts" className="text-xs" style={{ color: "var(--forest)", cursor: "pointer", textDecoration: "none" }}>Manage</Link>
            </div>
            {[
              { type: "new", title: "New evidence: rewilding outcomes for European bison", when: "Today, 06:14", src: "4 papers" },
              { type: "change", title: "CE rating updated for pond creation — Likely to Beneficial", when: "Yesterday", src: "Conservation Evidence" },
              { type: "project", title: "Heath Restoration: 2 new relevant studies", when: "2 days ago", src: "Project alert" },
            ].map((a, i) => (
              <div key={i} className="row gap-3 items-start" style={{ padding: "14px 24px", borderTop: "1px solid var(--rule-soft)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 7, background: a.type === "new" ? "var(--forest)" : a.type === "change" ? "var(--moss)" : "var(--clay)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.35 }}>{a.title}</div>
                  <div className="text-xs text-soft mono" style={{ marginTop: 4 }}>{a.when} &middot; {a.src}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* TNFD */}
          <Card style={{ background: "var(--forest-deep)", color: "oklch(0.95 0.015 155)", borderColor: "var(--forest-deep)" }}>
            <Eyebrow style={{ color: "oklch(0.7 0.04 155)" }}>TNFD module</Eyebrow>
            <div className="serif" style={{ fontSize: 20, margin: "6px 0 8px", letterSpacing: "-0.01em" }}>Q2 disclosure draft is ready for review.</div>
            <div className="text-sm" style={{ opacity: 0.8, marginBottom: 16 }}>4 metrics auto-populated &middot; 218 ha covered</div>
            <Link href="/tnfd" className="btn" style={{ background: "var(--moss)", color: "oklch(0.18 0.02 155)", fontWeight: 600, textDecoration: "none" }}>
              Open report <I.ArrowRight size={14} />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
