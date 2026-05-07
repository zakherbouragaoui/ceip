"use client";

import { useAlerts, useMarkAlertRead } from "@/lib/hooks/use-alerts";
import { Card, Eyebrow, Btn, Toggle } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts();
  const markRead = useMarkAlertRead();

  return (
    <div>
      <Eyebrow>Alerts</Eyebrow>
      <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 32px", letterSpacing: "-0.02em" }}>
        What&apos;s changed for you.
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        {/* Alert list */}
        <Card pad={false}>
          {isLoading ? (
            <div style={{ padding: 24 }} className="col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="pulse" style={{ height: 56, background: "var(--rule)", borderRadius: 6 }} />
              ))}
            </div>
          ) : !alerts?.length ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }} className="text-sm text-soft">
              No alerts yet. Evidence changes matching your projects and watchlists will appear here.
            </div>
          ) : (
            alerts.map((a, i) => (
              <div
                key={a.id}
                className="row gap-3 items-start"
                style={{
                  padding: 20,
                  borderBottom: i < alerts.length - 1 ? "1px solid var(--rule-soft)" : "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 4,
                    background: !a.sent ? "var(--forest-tint)" : "var(--bg)",
                    color: !a.sent ? "var(--forest)" : "var(--ink-mute)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <I.Sparkles size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.35 }}>
                    {a.paper_title || `New evidence: Paper ${a.paper_id}`}
                  </div>
                  <div className="text-xs text-soft mono" style={{ marginTop: 6 }}>
                    Relevance: {(a.score * 100).toFixed(0)}%
                    {a.created_at && ` · ${new Date(a.created_at).toLocaleDateString()}`}
                    {a.project_id && ` · Project ${a.project_id}`}
                  </div>
                </div>
                {!a.sent ? (
                  <Btn variant="outline" size="sm" onClick={() => markRead.mutate(a.id)}>
                    Mark read
                  </Btn>
                ) : (
                  <span className="badge">Read</span>
                )}
              </div>
            ))
          )}
        </Card>

        {/* Right rail */}
        <div className="col gap-4">
          <Card>
            <Eyebrow>Watchlists</Eyebrow>
            <div className="col gap-2" style={{ marginTop: 14 }}>
              {["Water vole recovery", "Heath rotational grazing", "Mink control", "Lacerta agilis", "Atlantic salmon barriers"].map(
                (w, i) => (
                  <div
                    key={i}
                    className="row justify-between items-center"
                    style={{ padding: "10px 12px", background: "var(--bg)", borderRadius: 6 }}
                  >
                    <div className="row items-center gap-2">
                      <I.Bell size={12} style={{ color: "var(--forest)" }} />
                      <span style={{ fontSize: 13 }}>{w}</span>
                    </div>
                    <span className="text-xs text-soft mono">{[3, 1, 2, 0, 4][i]} new</span>
                  </div>
                )
              )}
              <button className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
                <I.Plus size={13} /> New watchlist
              </button>
            </div>
          </Card>

          <Card>
            <Eyebrow>Digest</Eyebrow>
            <div className="text-sm text-soft" style={{ marginTop: 8, marginBottom: 12 }}>
              Weekly summary delivered every Monday.
            </div>
            <div className="row justify-between items-center">
              <span className="text-sm">Email digest</span>
              <Toggle defaultOn={true} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
