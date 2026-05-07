"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useProject, useUpdateProject } from "@/lib/hooks/use-projects";
import { useAlerts, useMarkAlertRead } from "@/lib/hooks/use-alerts";
import { Card, Eyebrow, Badge, Btn, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = parseInt(id, 10);
  const { data: project, isLoading } = useProject(projectId);
  const { data: alerts } = useAlerts(projectId);
  const markRead = useMarkAlertRead();
  const [tab, setTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="col gap-4">
        <div className="pulse" style={{ height: 32, width: 200, background: "var(--rule)", borderRadius: 6 }} />
        <div className="pulse" style={{ height: 16, width: 400, background: "var(--rule)", borderRadius: 4 }} />
        <div className="pulse" style={{ height: 240, background: "var(--rule)", borderRadius: 10 }} />
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <div className="text-sm text-soft" style={{ padding: "40px 0", textAlign: "center" }}>Project not found.</div>
      </Card>
    );
  }

  const speciesList = project.species_groups?.split(",").filter(Boolean) ?? [];
  const interventionList = project.intervention_types?.split(",").filter(Boolean) ?? [];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="row gap-2 text-sm text-soft" style={{ marginBottom: 12 }}>
        <Link href="/projects" style={{ cursor: "pointer", color: "var(--ink-soft)" }}>Projects</Link>
        <I.ChevronRight size={12} />
        <span>P-{project.id}</span>
      </div>

      {/* Header */}
      <div className="row justify-between items-start" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div className="row gap-2" style={{ marginBottom: 12 }}>
            <span className="badge mono">P-{project.id}</span>
            <Badge tone={project.is_active ? "strong" : "weak"} dot>
              {project.is_active ? "Active" : "Archived"}
            </Badge>
          </div>
          <h1 className="serif" style={{ fontSize: 40, margin: 0, letterSpacing: "-0.025em", lineHeight: 1 }}>
            {project.name}
          </h1>
          <div className="text-soft" style={{ marginTop: 8 }}>
            {project.geography || "No location"} &middot; Alert frequency: {project.alert_frequency || "weekly"}
          </div>
        </div>
        <div className="row gap-2">
          <Btn variant="outline" size="sm"><I.Download size={14} /> Export</Btn>
          <Btn variant="primary" size="sm"><I.Sparkles size={13} /> Synthesise project</Btn>
        </div>
      </div>

      <Photo h={240} tone="forest" caption={project.name} style={{ borderRadius: 10, marginBottom: 24 }} />

      {/* Tabs */}
      <div className="row" style={{ borderBottom: "1px solid var(--rule)", marginBottom: 24 }}>
        {["overview", "evidence", "species", "alerts", "team"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "var(--ink)" : "var(--ink-mute)",
              borderBottom: tab === t ? "2px solid var(--forest)" : "2px solid transparent",
              marginBottom: -1,
              textTransform: "capitalize",
              background: "none",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              borderBottomColor: tab === t ? "var(--forest)" : "transparent",
              cursor: "pointer",
            }}
          >
            {t}
            {t === "alerts" && alerts?.filter((a) => !a.sent).length ? (
              <span className="badge" style={{ marginLeft: 6, background: "var(--signal)", color: "white", borderColor: "transparent", fontSize: 10, padding: "1px 6px" }}>
                {alerts.filter((a) => !a.sent).length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div className="col gap-4">
          {tab === "overview" && (
            <>
              <Card>
                <Eyebrow>Description</Eyebrow>
                <div className="text-sm" style={{ marginTop: 8, lineHeight: 1.6 }}>
                  {project.description || "No description provided."}
                </div>
              </Card>

              {speciesList.length > 0 && (
                <Card>
                  <Eyebrow>Species groups</Eyebrow>
                  <div className="row gap-2" style={{ marginTop: 10, flexWrap: "wrap" }}>
                    {speciesList.map((s) => (
                      <span key={s} className="badge" style={{ textTransform: "capitalize" }}>{s.trim()}</span>
                    ))}
                  </div>
                </Card>
              )}

              {interventionList.length > 0 && (
                <Card>
                  <Eyebrow>Intervention types</Eyebrow>
                  <div className="row gap-2" style={{ marginTop: 10, flexWrap: "wrap" }}>
                    {interventionList.map((iv) => (
                      <span key={iv} className="badge">{iv.replace(/_/g, " ").trim()}</span>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {tab === "alerts" && (
            <Card pad={false}>
              {!alerts?.length ? (
                <div style={{ padding: "40px 24px", textAlign: "center" }} className="text-sm text-soft">
                  No alerts yet. New research matching your project will appear here.
                </div>
              ) : (
                alerts.map((a, i) => (
                  <div
                    key={a.id}
                    className="row gap-3 items-start"
                    style={{
                      padding: 20,
                      borderBottom: i < alerts.length - 1 ? "1px solid var(--rule-soft)" : "none",
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
                        {a.paper_title || `Paper ${a.paper_id}`}
                      </div>
                      <div className="text-xs text-soft mono" style={{ marginTop: 6 }}>
                        Relevance: {(a.score * 100).toFixed(0)}%
                        {a.created_at && ` · ${new Date(a.created_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    {!a.sent ? (
                      <Btn variant="outline" size="sm" onClick={() => markRead.mutate(a.id)}>
                        <I.Check size={12} /> Mark read
                      </Btn>
                    ) : (
                      <span className="badge">Read</span>
                    )}
                  </div>
                ))
              )}
            </Card>
          )}

          {tab === "evidence" && (
            <Card>
              <Eyebrow>Project evidence</Eyebrow>
              <div className="text-sm text-soft" style={{ marginTop: 8 }}>
                Run a synthesis to find the highest-evidence interventions for this project&apos;s species mix.
              </div>
              <Btn variant="primary" style={{ marginTop: 16 }}>
                <I.Sparkles size={13} /> Run project synthesis
              </Btn>
            </Card>
          )}

          {tab === "species" && (
            <Card>
              <Eyebrow>Project species</Eyebrow>
              {speciesList.length > 0 ? (
                <div className="col gap-2" style={{ marginTop: 12 }}>
                  {speciesList.map((s) => (
                    <div key={s} className="row gap-3 items-center" style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 6 }}>
                      <I.Leaf size={14} style={{ color: "var(--forest)" }} />
                      <span className="serif" style={{ fontStyle: "italic", fontSize: 15 }}>{s.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-soft" style={{ marginTop: 8 }}>No species groups assigned.</div>
              )}
            </Card>
          )}

          {tab === "team" && (
            <Card>
              <Eyebrow>Team</Eyebrow>
              <div className="text-sm text-soft" style={{ marginTop: 8 }}>Team management coming soon.</div>
            </Card>
          )}
        </div>

        {/* Right rail */}
        <div className="col gap-4">
          <Card>
            <Eyebrow>Details</Eyebrow>
            <div className="text-sm" style={{ marginTop: 12 }}>
              <div className="row justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <span className="text-soft">Status</span>
                <Badge tone={project.is_active ? "strong" : "weak"} dot>
                  {project.is_active ? "Active" : "Archived"}
                </Badge>
              </div>
              <div className="row justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <span className="text-soft">Location</span>
                <span className="mono">{project.geography || "—"}</span>
              </div>
              <div className="row justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <span className="text-soft">Alerts</span>
                <span className="mono">{project.alert_frequency || "weekly"}</span>
              </div>
              <div className="row justify-between" style={{ padding: "8px 0" }}>
                <span className="text-soft">Unread alerts</span>
                <span className="mono" style={{ color: "var(--forest)" }}>{alerts?.filter((a) => !a.sent).length ?? 0}</span>
              </div>
            </div>
          </Card>

          <Card>
            <Eyebrow>Watching</Eyebrow>
            <div className="col gap-2 text-sm" style={{ marginTop: 10 }}>
              {speciesList.slice(0, 3).map((s) => (
                <div key={s} className="row gap-2 items-center">
                  <I.Bell size={12} style={{ color: "var(--forest)" }} />
                  <em style={{ fontFamily: "var(--font-serif)" }}>{s.trim()}</em>
                </div>
              ))}
              {speciesList.length === 0 && <div className="text-soft">No watchlist items.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
