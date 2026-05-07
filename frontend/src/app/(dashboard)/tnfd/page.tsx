"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Eyebrow, Badge, Btn, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

function Metric({ label, value, sub, auto }: { label: string; value: string; sub: string; auto?: boolean }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row justify-between" style={{ marginBottom: 6 }}>
        <div className="text-xs text-soft mono" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        {auto && (
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--forest)", background: "var(--forest-tint)", padding: "1px 5px", borderRadius: 2, letterSpacing: "0.08em" }}>
            AUTO
          </span>
        )}
      </div>
      <div className="serif" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{value}</div>
      <div className="text-xs text-soft" style={{ marginTop: 4 }}>{sub}</div>
    </div>
  );
}

const sections = [
  { id: "locate", l: "L \u00b7 Locate", n: "01" },
  { id: "evaluate", l: "E \u00b7 Evaluate", n: "02" },
  { id: "assess", l: "A \u00b7 Assess", n: "03" },
  { id: "prepare", l: "P \u00b7 Prepare", n: "04" },
];

export default function TNFDPage() {
  const [section, setSection] = useState("locate");

  return (
    <div>
      <div className="row gap-2 text-sm text-soft" style={{ marginBottom: 12 }}>
        <Link href="/projects" style={{ cursor: "pointer", color: "var(--ink-soft)" }}>Projects</Link>
        <I.ChevronRight size={12} />
        <span>TNFD report</span>
      </div>

      <div className="row justify-between items-start" style={{ marginBottom: 24 }}>
        <div>
          <Eyebrow>TNFD / CSRD module</Eyebrow>
          <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 0", letterSpacing: "-0.02em" }}>Q2 2026 disclosure draft</h1>
          <div className="row gap-2" style={{ marginTop: 12 }}>
            <Badge tone="strong" dot>Auto-populated &middot; 4 / 14 metrics</Badge>
            <span className="badge mono">v0.3 draft</span>
            <span className="badge mono"><I.Clock size={11} /> Last sync 4h ago</span>
          </div>
        </div>
        <div className="row gap-2">
          <Btn variant="outline" size="sm">Share with auditor</Btn>
          <Btn variant="outline" size="sm"><I.Download size={14} /> PDF</Btn>
          <Btn variant="primary" size="sm"><I.Sparkles size={13} /> Re-synthesise</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", gap: 24 }}>
        {/* LEAP nav */}
        <div className="col gap-1" style={{ alignSelf: "start", position: "sticky", top: 90 }}>
          <div className="eyebrow" style={{ marginBottom: 8, padding: "0 12px" }}>LEAP framework</div>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                padding: "12px 14px",
                borderRadius: 6,
                textAlign: "left",
                background: section === s.id ? "var(--forest-tint)" : "transparent",
                color: section === s.id ? "var(--forest-deep)" : "var(--ink-soft)",
                fontWeight: section === s.id ? 500 : 400,
                border: "1px solid " + (section === s.id ? "var(--forest-soft, var(--forest-tint))" : "transparent"),
                cursor: "pointer",
              }}
            >
              <div className="mono text-xs" style={{ opacity: 0.6, marginBottom: 2 }}>{s.n}</div>
              <div style={{ fontSize: 14 }}>{s.l}</div>
            </button>
          ))}

          <div className="eyebrow" style={{ marginTop: 24, marginBottom: 8, padding: "0 12px" }}>Coverage</div>
          <div style={{ padding: "0 14px" }}>
            <div className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>4 / 14</div>
            <div style={{ height: 4, background: "var(--rule-soft)", borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
              <div style={{ width: "28%", height: "100%", background: "var(--forest)" }} />
            </div>
            <div className="text-xs text-soft mono" style={{ marginTop: 6 }}>28% disclosure complete</div>
          </div>
        </div>

        {/* Document body */}
        <div>
          {section === "locate" && (
            <Card pad={false}>
              <div style={{ padding: "24px 32px 0" }}>
                <div className="mono text-xs text-soft">SECTION 01</div>
                <h2 className="serif" style={{ fontSize: 32, margin: "4px 0 6px", letterSpacing: "-0.02em" }}>Locate the interface</h2>
                <p className="text-soft" style={{ marginBottom: 0 }}>Where in the value chain do nature-related issues exist?</p>
              </div>

              <div style={{ padding: "24px 32px", borderTop: "1px solid var(--rule)", marginTop: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>1.1 Spatial footprint</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <Metric label="Total area under management" value="218 ha" sub="Bodmin Heath SSSI" auto />
                  <Metric label="Sensitive locations" value="3 of 3" sub="100% in WDPA Cat IV" auto />
                  <Metric label="Biome" value="Temperate heath" sub="WWF code PA0813" auto />
                  <Metric label="Latitude / longitude" value="50.55, −4.59" sub="Centroid · WGS84" auto />
                </div>
                <Photo h={180} tone="forest" caption="Site footprint — Bodmin Heath SSSI" style={{ borderRadius: 6 }} />
              </div>

              <div style={{ padding: "24px 32px", borderTop: "1px solid var(--rule)" }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>1.2 Material sensitivity</div>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                      <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 500, color: "var(--ink-mute)" }}>Designation</th>
                      <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 500, color: "var(--ink-mute)" }}>Coverage</th>
                      <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 500, color: "var(--ink-mute)" }}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["SSSI · Bodmin Heath", "218 ha (100%)", "Natural England · auto"],
                      ["SAC · Breney Common", "46 ha overlap", "JNCC · auto"],
                      ["Annex I habitat 4030", "142 ha", "EUNIS · auto"],
                      ["IUCN priority — Lacerta agilis range", "218 ha", "IUCN Red List · auto"],
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                        <td style={{ padding: "10px 0" }}>{r[0]}</td>
                        <td className="mono" style={{ padding: "10px 0" }}>{r[1]}</td>
                        <td className="text-soft mono text-xs" style={{ padding: "10px 0" }}>{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: "24px 32px", borderTop: "1px solid var(--rule)" }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>1.3 Narrative</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>
                  The reporting entity manages 218 ha of lowland heath under SSSI designation, of which 142 ha qualify as Annex I priority habitat 4030 (European dry heaths). The site falls entirely within the IUCN Red List range for <em style={{ fontFamily: "var(--font-serif)" }}>Lacerta agilis</em> (Sand lizard, LC) and contains 46 ha of overlap with Breney Common SAC.
                </p>
                <div className="row gap-2" style={{ marginTop: 14 }}>
                  <span className="badge mono"><I.Sparkles size={11} /> AI draft &middot; 22 citations validated</span>
                  <button className="btn btn-ghost btn-sm">Edit narrative</button>
                </div>
              </div>
            </Card>
          )}

          {section === "evaluate" && (
            <Card pad={false}>
              <div style={{ padding: "24px 32px" }}>
                <div className="mono text-xs text-soft">SECTION 02</div>
                <h2 className="serif" style={{ fontSize: 32, margin: "4px 0 6px", letterSpacing: "-0.02em" }}>Evaluate dependencies &amp; impacts</h2>
                <p className="text-soft">Material dependencies on nature, and impacts caused by activities under management.</p>
              </div>
              <div style={{ padding: "0 32px 24px" }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>2.1 Dependency matrix</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {([
                    ["Pollination", "High", "strong"],
                    ["Soil quality", "High", "strong"],
                    ["Climate regulation", "Med", "moderate"],
                    ["Water flow", "Med", "moderate"],
                    ["Pest control", "High", "strong"],
                    ["Genetic resources", "Low", "weak"],
                    ["Erosion control", "High", "strong"],
                    ["Disease regulation", "Med", "moderate"],
                  ] as [string, string, "strong" | "moderate" | "weak"][]).map(([n, lvl, t], i) => (
                    <div key={i} className="card" style={{ padding: 14 }}>
                      <div className="text-xs text-soft mono" style={{ marginBottom: 8 }}>{n}</div>
                      <Badge tone={t} dot>{lvl}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {section === "assess" && (
            <Card pad={false}>
              <div style={{ padding: "24px 32px" }}>
                <div className="mono text-xs text-soft">SECTION 03</div>
                <h2 className="serif" style={{ fontSize: 32, margin: "4px 0 6px", letterSpacing: "-0.02em" }}>Assess risks &amp; opportunities</h2>
                <p className="text-soft">Material nature-related risks and opportunity identification.</p>
              </div>
              <div style={{ padding: "0 32px 24px" }}>
                <div className="col gap-3">
                  {([
                    { type: "Risk", sev: "High", name: "Bracken expansion under projected warming", body: "Modelled +14% bracken cover by 2035. Mitigation: annual rolling.", tone: "weak" as const },
                    { type: "Risk", sev: "Med", name: "Wildfire frequency in dry summers", body: "Bodmin baseline 0.3 events/yr; trend +0.1/decade.", tone: "moderate" as const },
                    { type: "Opportunity", sev: "High", name: "Biodiversity Net Gain credits", body: "Site qualifies for 8.4 distinctiveness units under DEFRA metric 4.0.", tone: "strong" as const },
                    { type: "Opportunity", sev: "Med", name: "Carbon co-benefits via heath restoration", body: "Estimated 1.2 tCO\u2082e/ha/yr sequestration.", tone: "strong" as const },
                  ]).map((r, i) => (
                    <div key={i} className="card" style={{ padding: 18 }}>
                      <div className="row justify-between items-start">
                        <div className="row gap-2" style={{ marginBottom: 8 }}>
                          <Badge tone={r.tone} dot>{r.type}</Badge>
                          <span className="badge mono">{r.sev}</span>
                        </div>
                        <I.ArrowUpRight size={14} style={{ color: "var(--ink-mute)" }} />
                      </div>
                      <div className="serif" style={{ fontSize: 18, lineHeight: 1.2, marginBottom: 6, letterSpacing: "-0.01em" }}>{r.name}</div>
                      <div className="text-sm text-soft">{r.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {section === "prepare" && (
            <Card pad={false}>
              <div style={{ padding: "24px 32px" }}>
                <div className="mono text-xs text-soft">SECTION 04</div>
                <h2 className="serif" style={{ fontSize: 32, margin: "4px 0 6px", letterSpacing: "-0.02em" }}>Prepare to respond &amp; report</h2>
                <p className="text-soft">Strategic response, target setting, and disclosure readiness.</p>
              </div>
              <div style={{ padding: "0 32px 24px" }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>4.1 Targets</div>
                <div className="col gap-2" style={{ marginBottom: 24 }}>
                  {([
                    ["Calluna canopy cover \u2265 60%", 54, 60],
                    ["Bare-ground mosaic on south slopes \u2265 8%", 5.2, 8],
                    ["Lacerta agilis density \u2265 1.2 / ha", 0.8, 1.2],
                    ["Annex I 4030 favourable status", 142, 218],
                  ] as [string, number, number][]).map(([n, cur, tgt], i) => (
                    <div key={i} className="card" style={{ padding: 14 }}>
                      <div className="row justify-between items-start" style={{ marginBottom: 8 }}>
                        <div className="text-sm" style={{ fontWeight: 500 }}>{n}</div>
                        <div className="mono text-xs text-soft">{cur} / {tgt}</div>
                      </div>
                      <div style={{ height: 5, background: "var(--rule-soft)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: ((cur / tgt) * 100).toFixed(0) + "%", height: "100%", background: "var(--forest)" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>4.2 Disclosure readiness</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {([["Locate", 92], ["Evaluate", 64], ["Assess", 48], ["Prepare", 22]] as [string, number][]).map(([s, p], i) => (
                    <div key={i} className="card" style={{ padding: 14, textAlign: "center" }}>
                      <div className="text-xs text-soft mono" style={{ marginBottom: 6 }}>{s}</div>
                      <div className="serif" style={{ fontSize: 28, color: "var(--forest)", letterSpacing: "-0.02em" }}>{p}<span style={{ fontSize: 14 }}>%</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* AI assist rail */}
        <div className="col gap-4" style={{ alignSelf: "start", position: "sticky", top: 90 }}>
          <Card style={{ background: "var(--forest-deep)", color: "oklch(0.95 0.015 155)", borderColor: "var(--forest-deep)" }}>
            <div className="row gap-2 items-center" style={{ marginBottom: 8 }}>
              <I.Sparkles size={14} />
              <Eyebrow style={{ color: "oklch(0.7 0.04 155)" }}>AI assist</Eyebrow>
            </div>
            <div className="serif" style={{ fontSize: 17, lineHeight: 1.3, marginBottom: 12 }}>
              4 metrics auto-populated. 10 require your input.
            </div>
            <div className="text-sm" style={{ opacity: 0.8, marginBottom: 16 }}>
              I can draft narrative for remaining sections from your project&apos;s evidence base.
            </div>
            <button className="btn" style={{ background: "var(--moss)", color: "oklch(0.18 0.02 155)", fontWeight: 600, width: "100%", justifyContent: "center" }}>
              Draft remaining sections <I.ArrowRight size={13} />
            </button>
          </Card>

          <Card>
            <Eyebrow>Audit trail</Eyebrow>
            <div className="col" style={{ marginTop: 10 }}>
              {([
                ["v0.3 draft", "Today, 14:22", "Elena"],
                ["Auto-pull · IUCN", "Today, 04:00", "System"],
                ["v0.2 draft", "23 Apr", "Elena"],
                ["Created from template", "12 Apr", "Robin"],
              ] as [string, string, string][]).map(([v, w, who], i) => (
                <div key={i} className="row gap-3 items-start" style={{ padding: "10px 0", borderTop: i ? "1px solid var(--rule-soft)" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 50, background: i === 0 ? "var(--forest)" : "var(--rule)", marginTop: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div className="text-sm" style={{ fontWeight: 500 }}>{v}</div>
                    <div className="text-xs text-soft mono">{w} &middot; {who}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
