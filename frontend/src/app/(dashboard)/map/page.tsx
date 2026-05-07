"use client";

import { useState } from "react";
import { Card, Eyebrow, Badge, Btn, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

const sites = [
  { name: "Bodmin Heath", x: 22, y: 58, type: "Active", species: 14, area: "218 ha", tone: "forest" as const },
  { name: "River Camel", x: 30, y: 42, type: "Active", species: 8, area: "34 km", tone: "sea" as const },
  { name: "Lizard Peninsula", x: 14, y: 78, type: "Planning", species: 22, area: "46 ha", tone: "sand" as const },
  { name: "Atlantic Oakwood", x: 36, y: 30, type: "Reporting", species: 31, area: "102 ha", tone: "moss" as const },
  { name: "Wistman's Wood", x: 28, y: 36, type: "Watch", species: 18, area: "14 ha", tone: "stone" as const },
  { name: "Goss Moor", x: 24, y: 50, type: "Watch", species: 9, area: "480 ha", tone: "sand" as const },
  { name: "Tamar Valley", x: 38, y: 48, type: "Active", species: 12, area: "80 ha", tone: "forest" as const },
];

const pinColor: Record<string, string> = {
  Active: "var(--forest)",
  Planning: "var(--clay)",
  Reporting: "var(--moss)",
  Watch: "var(--ink-soft)",
};

export default function MapPage() {
  const [selected, setSelected] = useState(0);
  const s = sites[selected];

  return (
    <div>
      <div className="row justify-between items-end" style={{ marginBottom: 24 }}>
        <div>
          <Eyebrow>Map view</Eyebrow>
          <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 0", letterSpacing: "-0.02em" }}>
            {sites.length} sites in motion. <span style={{ color: "var(--ink-mute)" }}>Cornwall &amp; West Devon.</span>
          </h1>
        </div>
        <div className="row gap-2">
          <Btn variant="outline" size="sm"><I.Layers size={14} /> Layers</Btn>
          <Btn variant="outline" size="sm"><I.Download size={14} /> Export GeoJSON</Btn>
          <Btn variant="primary" size="sm"><I.Plus size={13} /> Add site</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        {/* Map canvas */}
        <Card pad={false} style={{ position: "relative", overflow: "hidden" }}>
          <div
            style={{
              height: 620,
              position: "relative",
              background: "linear-gradient(165deg, oklch(0.85 0.04 200), oklch(0.78 0.05 130) 40%, oklch(0.68 0.06 100))",
            }}
          >
            {/* Topographic SVG layers */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {/* Coast */}
              <path d="M 0 70 Q 8 65 14 72 Q 22 80 30 76 Q 42 72 48 80 Q 60 88 72 82 Q 86 76 100 84 L 100 100 L 0 100 Z" fill="oklch(0.55 0.08 220 / 0.5)" />
              <path d="M 0 72 Q 8 67 14 74 Q 22 82 30 78 Q 42 74 48 82 Q 60 90 72 84 Q 86 78 100 86 L 100 100 L 0 100 Z" fill="oklch(0.45 0.08 220 / 0.4)" />
              {/* Contour lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <path key={i} d={`M ${5 + i * 2} ${20 + i * 8} Q ${30 - i * 3} ${25 + i * 5} ${50 + i} ${30 + i * 7} T ${95 - i} ${40 + i * 9}`} fill="none" stroke="oklch(0.35 0.03 90 / 0.18)" strokeWidth="0.2" />
              ))}
              {/* Rivers */}
              <path d="M 30 5 Q 28 25 30 42 Q 32 55 28 70" fill="none" stroke="oklch(0.5 0.1 220)" strokeWidth="0.5" opacity="0.7" />
              <path d="M 38 10 Q 40 30 38 48 Q 36 60 40 75" fill="none" stroke="oklch(0.5 0.1 220)" strokeWidth="0.4" opacity="0.6" />
              {/* Forest patches */}
              <ellipse cx="34" cy="32" rx="6" ry="4" fill="oklch(0.42 0.08 145 / 0.45)" />
              <ellipse cx="22" cy="58" rx="9" ry="5" fill="oklch(0.5 0.06 110 / 0.4)" />
              <ellipse cx="38" cy="48" rx="5" ry="3" fill="oklch(0.42 0.08 145 / 0.4)" />
            </svg>

            {/* Pins */}
            {sites.map((site, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  position: "absolute",
                  left: site.x + "%",
                  top: site.y + "%",
                  transform: "translate(-50%, -100%)",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: selected === i ? 36 : 26,
                    height: selected === i ? 36 : 26,
                    background: pinColor[site.type] || "var(--ink-soft)",
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(-45deg)",
                    border: "3px solid oklch(0.97 0.008 85)",
                    boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)",
                    display: "grid",
                    placeItems: "center",
                    transition: "all .15s",
                  }}
                >
                  <span
                    style={{
                      transform: "rotate(45deg)",
                      color: "oklch(0.97 0.015 155)",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {site.species}
                  </span>
                </div>
                {selected === i && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 10px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--paper)",
                      padding: "6px 10px",
                      borderRadius: 4,
                      boxShadow: "0 4px 12px oklch(0 0 0 / 0.18)",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {site.name}
                  </div>
                )}
              </button>
            ))}

            {/* Map controls */}
            <div className="col gap-1" style={{ position: "absolute", top: 16, right: 16 }}>
              <button className="tb-icon-btn" style={{ background: "var(--paper)", boxShadow: "0 2px 6px oklch(0 0 0 / 0.1)" }}><I.Plus size={14} /></button>
              <button className="tb-icon-btn" style={{ background: "var(--paper)", boxShadow: "0 2px 6px oklch(0 0 0 / 0.1)" }}><span style={{ fontWeight: 700 }}>&minus;</span></button>
              <button className="tb-icon-btn" style={{ background: "var(--paper)", boxShadow: "0 2px 6px oklch(0 0 0 / 0.1)" }}><I.Compass size={14} /></button>
            </div>

            {/* Legend */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                background: "oklch(0.97 0.008 85 / 0.95)",
                padding: 14,
                borderRadius: 6,
                backdropFilter: "blur(8px)",
                minWidth: 180,
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 8 }}>Legend</div>
              {([
                ["Active", "var(--forest)"],
                ["Planning", "var(--clay)"],
                ["Reporting", "var(--moss)"],
                ["Watch", "var(--ink-soft)"],
              ] as const).map(([l, c]) => (
                <div key={l} className="row gap-2 items-center text-sm" style={{ padding: "3px 0" }}>
                  <span style={{ width: 10, height: 10, background: c, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)" }} />
                  {l}
                </div>
              ))}
            </div>

            {/* Scale */}
            <div className="mono text-xs" style={{ position: "absolute", bottom: 16, right: 16, color: "oklch(0.18 0.02 155)", background: "oklch(0.97 0.008 85 / 0.85)", padding: "4px 10px", borderRadius: 3 }}>
              ━━━━ 10 km
            </div>
          </div>
        </Card>

        {/* Site detail rail */}
        <div className="col gap-4">
          <Card pad={false}>
            <Photo h={140} tone={s.tone} caption={s.name + " — site photo"} />
            <div style={{ padding: 20 }}>
              <Badge tone={s.type === "Active" ? "strong" : s.type === "Planning" ? "weak" : "moderate"} dot>{s.type}</Badge>
              <div className="serif" style={{ fontSize: 22, marginTop: 10, letterSpacing: "-0.01em" }}>{s.name}</div>
              <div className="row gap-4" style={{ marginTop: 14 }}>
                <div>
                  <div className="serif" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{s.species}</div>
                  <div className="text-xs text-soft mono">species</div>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{s.area}</div>
                  <div className="text-xs text-soft mono">area</div>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>4</div>
                  <div className="text-xs text-soft mono">interventions</div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
                Open project <I.ArrowRight size={13} />
              </button>
            </div>
          </Card>

          <Card>
            <Eyebrow>Layer toggle</Eyebrow>
            <div className="col" style={{ marginTop: 12 }}>
              {([
                ["WDPA protected areas", true],
                ["IUCN species ranges", true],
                ["Habitat suitability", false],
                ["Site boundaries", true],
                ["Connectivity corridors", false],
              ] as [string, boolean][]).map(([n, on], i) => (
                <label key={i} className="row justify-between items-center" style={{ padding: "8px 0", borderBottom: i < 4 ? "1px solid var(--rule-soft)" : "none" }}>
                  <span className="text-sm">{n}</span>
                  <input type="checkbox" defaultChecked={on} />
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <Eyebrow>Nearby evidence</Eyebrow>
            <div className="text-sm text-soft" style={{ marginTop: 6, marginBottom: 12 }}>Studies within 50 km of {s.name}.</div>
            <div className="col gap-2">
              {[
                "Heather burning vs. cutting on lowland heath",
                "Reptile microhabitat in mosaic landscapes",
                "Cornish coastal grazing rotation outcomes",
              ].map((t, i) => (
                <div key={i} className="row gap-2 items-start text-sm" style={{ padding: "6px 0", borderBottom: i < 2 ? "1px solid var(--rule-soft)" : "none" }}>
                  <I.FileText size={12} style={{ color: "var(--forest)", marginTop: 4, flexShrink: 0 }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
