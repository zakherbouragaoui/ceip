"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects, useCreateProject, useDeleteProject } from "@/lib/hooks/use-projects";
import type { ConservationProject } from "@/lib/types";
import { Card, Eyebrow, Badge, Btn, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

const tabs = ["All", "Active", "Planning", "Reporting", "Archived"];

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [tab, setTab] = useState("All");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = projects?.filter((p) => {
    if (tab === "All") return true;
    if (tab === "Active") return p.is_active === 1;
    if (tab === "Archived") return p.is_active === 0;
    return true;
  });

  return (
    <div>
      <div className="row justify-between items-end" style={{ marginBottom: 24 }}>
        <div>
          <Eyebrow>Projects</Eyebrow>
          <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 0", letterSpacing: "-0.02em" }}>
            {projects?.filter((p) => p.is_active).length ?? 0} active workspaces.{" "}
            <span style={{ color: "var(--ink-mute)" }}>Track and manage conservation projects.</span>
          </h1>
        </div>
        <Btn variant="primary" onClick={() => setFormOpen(true)}>
          <I.Plus size={14} /> New project
        </Btn>
      </div>

      <div className="row gap-2" style={{ marginBottom: 20 }}>
        {tabs.map((f) => (
          <button
            key={f}
            className="btn btn-outline btn-sm"
            onClick={() => setTab(f)}
            style={{
              background: tab === f ? "var(--forest)" : undefined,
              color: tab === f ? "oklch(0.97 0.015 155)" : undefined,
              borderColor: tab === f ? "var(--forest)" : undefined,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="col gap-3">
                <div className="pulse" style={{ height: 20, width: "60%", background: "var(--rule)", borderRadius: 4 }} />
                <div className="pulse" style={{ height: 16, width: "100%", background: "var(--rule)", borderRadius: 4 }} />
                <div className="pulse" style={{ height: 16, width: "40%", background: "var(--rule)", borderRadius: 4 }} />
              </div>
            </Card>
          ))}
        </div>
      ) : !filtered?.length ? (
        <Card>
          <div style={{ padding: "40px 0", textAlign: "center" }} className="text-sm text-soft">
            {tab === "All" ? "No projects yet." : `No ${tab.toLowerCase()} projects.`}
            {tab !== "Archived" && (
              <div style={{ marginTop: 12 }}>
                <Btn variant="outline" size="sm" onClick={() => setFormOpen(true)}>
                  <I.Plus size={13} /> Create your first project
                </Btn>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {filtered.map((p) => (
            <Card key={p.id} pad={false}>
              <Link href={`/projects/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr" }}>
                  <Photo h={200} tone={p.is_active ? "forest" : "stone"} caption={p.name} />
                  <div style={{ padding: 22 }}>
                    <div className="row gap-2" style={{ marginBottom: 8 }}>
                      <span className="badge mono">P-{p.id}</span>
                      <span
                        className="badge"
                        style={{
                          background: p.is_active ? "oklch(0.93 0.04 155)" : "oklch(0.93 0.02 0)",
                          color: p.is_active ? "oklch(0.32 0.06 155)" : "var(--ink-mute)",
                          borderColor: "transparent",
                        }}
                      >
                        {p.is_active ? "Active" : "Archived"}
                      </span>
                    </div>
                    <div className="serif" style={{ fontSize: 20, lineHeight: 1.2, marginBottom: 8, letterSpacing: "-0.01em" }}>
                      {p.name}
                    </div>
                    <div className="text-sm text-soft" style={{ marginBottom: 12 }}>
                      {p.species_groups
                        ?.split(",")
                        .filter(Boolean)
                        .map((s) => (
                          <em key={s} style={{ fontFamily: "var(--font-serif)", marginRight: 8 }}>
                            {s}
                          </em>
                        ))}
                    </div>
                    {p.geography && (
                      <div className="row gap-1 items-center text-xs text-soft">
                        <I.Map size={11} /> {p.geography}
                      </div>
                    )}
                    {p.description && (
                      <div className="text-xs text-soft" style={{ marginTop: 6, lineHeight: 1.4 }}>
                        {p.description.length > 100 ? p.description.slice(0, 100) + "…" : p.description}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Simple inline create form */}
      {formOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(0.18 0.02 155 / 0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
          }}
          onClick={() => setFormOpen(false)}
        >
          <div style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
          <Card>
            <Eyebrow>New project</Eyebrow>
            <h2 className="serif" style={{ fontSize: 24, margin: "6px 0 20px", letterSpacing: "-0.01em" }}>
              Create a new project
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createProject.mutate(
                  {
                    name: fd.get("name") as string,
                    description: fd.get("description") as string,
                    species_groups: fd.get("species_groups") as string,
                    geography: fd.get("geography") as string,
                  },
                  { onSuccess: () => setFormOpen(false) }
                );
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <label className="label">Project name</label>
                <input className="input" name="name" required placeholder="e.g. Bodmin Heath Restoration" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Description</label>
                <textarea className="input" name="description" rows={2} placeholder="Brief description..." />
              </div>
              <div className="row gap-3" style={{ marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Species groups (comma separated)</label>
                  <input className="input" name="species_groups" placeholder="mammals, birds" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Geography</label>
                  <input className="input" name="geography" placeholder="Cornwall, UK" />
                </div>
              </div>
              <div className="row justify-end gap-2" style={{ marginTop: 20 }}>
                <Btn variant="ghost" type="button" onClick={() => setFormOpen(false)}>Cancel</Btn>
                <Btn variant="primary" type="submit">
                  {createProject.isPending ? "Creating…" : "Create project"}
                </Btn>
              </div>
            </form>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
