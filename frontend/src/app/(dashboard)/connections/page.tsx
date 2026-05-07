"use client";

import { useState } from "react";
import { Card, Eyebrow, Badge } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

interface Connection {
  id: string;
  name: string;
  desc: string;
  status: "connected" | "available";
  when: string | null;
}

const initialConnections: Connection[] = [
  { id: "orcid", name: "ORCID", desc: "Verify researcher identity & sync publications", status: "connected", when: "Connected 12 Mar" },
  { id: "zotero", name: "Zotero", desc: "Two-way sync of citation library", status: "connected", when: "Connected 4 Jan" },
  { id: "gbif", name: "GBIF", desc: "Occurrence records for species lookup", status: "available", when: null },
  { id: "iucn", name: "IUCN Red List", desc: "Threat assessments and trend data", status: "connected", when: "Connected 4 Jan" },
  { id: "inat", name: "iNaturalist", desc: "Field observations linked to projects", status: "available", when: null },
  { id: "mendeley", name: "Mendeley", desc: "Citation library two-way sync", status: "available", when: null },
  { id: "ms", name: "Microsoft 365", desc: "Sign-in, calendar & sharing for team", status: "available", when: null },
  { id: "google", name: "Google Workspace", desc: "Sign-in, drive sharing for team reports", status: "connected", when: "Connected 22 Feb" },
  { id: "pp", name: "Protected Planet", desc: "Pull WDPA boundaries into projects", status: "available", when: null },
  { id: "slack", name: "Slack", desc: "Send weekly evidence digests to channels", status: "available", when: null },
];

export default function ConnectionsPage() {
  const [items, setItems] = useState<Connection[]>(initialConnections);

  function toggle(id: string) {
    setItems(
      items.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === "connected" ? "available" : "connected",
              when: c.status === "connected" ? null : "Connected just now",
            }
          : c
      )
    );
  }

  return (
    <div>
      <Eyebrow>Profile connections</Eyebrow>
      <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 8px", letterSpacing: "-0.02em" }}>Connect your tools</h1>
      <p className="text-soft" style={{ marginBottom: 32, maxWidth: 600 }}>
        CEIP works best when your citations, occurrence data, and team identity flow in from where you already work.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {items.map((c) => (
          <Card key={c.id}>
            <div className="row gap-3 items-start">
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: c.status === "connected" ? "var(--forest)" : "var(--bg)",
                  color: c.status === "connected" ? "oklch(0.97 0.015 155)" : "var(--ink)",
                  border: "1px solid " + (c.status === "connected" ? "var(--forest)" : "var(--rule)"),
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div className="row justify-between items-start">
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                    <div className="text-xs text-soft" style={{ marginTop: 2 }}>{c.desc}</div>
                  </div>
                  {c.status === "connected" && (
                    <Badge tone="strong"><I.Check size={10} /> Connected</Badge>
                  )}
                </div>
                <div className="row justify-between items-center" style={{ marginTop: 14 }}>
                  <span className="text-xs text-soft mono">{c.when || "Not connected"}</span>
                  <button
                    onClick={() => toggle(c.id)}
                    className={`btn btn-sm ${c.status === "connected" ? "btn-outline" : "btn-primary"}`}
                  >
                    {c.status === "connected" ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
