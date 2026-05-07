"use client";

import { Card, Eyebrow, Btn, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function DigestPage() {
  return (
    <div>
      <div className="row justify-between items-end" style={{ marginBottom: 24 }}>
        <div>
          <Eyebrow>Email digest</Eyebrow>
          <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 0", letterSpacing: "-0.02em" }}>Weekly digest preview</h1>
          <div className="text-soft text-sm" style={{ marginTop: 8 }}>This is what your subscribers receive every Monday at 07:00 local.</div>
        </div>
        <div className="row gap-2">
          <Btn variant="outline" size="sm">Edit template</Btn>
          <Btn variant="outline" size="sm">Send test to me</Btn>
          <Btn variant="primary" size="sm"><I.Mail size={13} /> Send digest now</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Email canvas */}
        <div style={{ background: "oklch(0.93 0.012 85)", padding: 32, borderRadius: 10 }}>
          <div className="card" style={{ marginBottom: 16, padding: "14px 20px", background: "var(--paper)" }}>
            <div className="row justify-between items-center">
              <div>
                <div className="text-xs text-soft mono">FROM &middot; digest@ceip.app</div>
                <div className="text-sm" style={{ fontWeight: 500, marginTop: 2 }}>This week in your evidence &mdash; 4 changes for your watchlist</div>
              </div>
              <div className="text-xs text-soft mono">Mon &middot; 07:00</div>
            </div>
          </div>

          <div style={{ background: "var(--paper)", borderRadius: 6, overflow: "hidden", maxWidth: 640, margin: "0 auto", boxShadow: "0 4px 16px oklch(0 0 0 / 0.06)" }}>
            {/* Banner */}
            <div style={{ padding: "24px 32px", background: "var(--forest-deep)", color: "oklch(0.95 0.015 155)" }}>
              <div className="row items-center gap-2" style={{ marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, background: "oklch(0.92 0.015 155)", color: "var(--forest-deep)", borderRadius: 4, display: "grid", placeItems: "center", fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 500 }}>C</div>
                <div className="serif" style={{ fontSize: 16 }}>CEIP Weekly</div>
              </div>
              <div className="serif" style={{ fontSize: 26, letterSpacing: "-0.015em", lineHeight: 1.15 }}>
                4 changes affect your watchlist this week.
              </div>
              <div className="text-sm" style={{ opacity: 0.75, marginTop: 8 }}>Monday, 25 April 2026 &middot; for you</div>
            </div>

            {/* Stat strip */}
            <div className="row" style={{ borderBottom: "1px solid var(--rule)" }}>
              {([
                ["+103", "new papers"],
                ["2", "CE rating updates"],
                ["1", "IUCN change"],
                ["4", "for your queries"],
              ] as [string, string][]).map(([n, l], i) => (
                <div key={i} style={{ flex: 1, padding: "16px 12px", textAlign: "center", borderRight: i < 3 ? "1px solid var(--rule)" : "none" }}>
                  <div className="serif" style={{ fontSize: 24, color: "var(--forest)", letterSpacing: "-0.02em" }}>{n}</div>
                  <div className="text-xs text-soft mono" style={{ marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Top change */}
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--rule)" }}>
              <div className="eyebrow" style={{ color: "var(--forest)", marginBottom: 8 }}>&#9733; Top change</div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 8 }}>
                &ldquo;Creating ponds for amphibians&rdquo; &mdash; CE rating upgraded from <em>Likely Beneficial</em> to <em>Beneficial</em>.
              </div>
              <div className="text-sm text-soft" style={{ marginBottom: 12 }}>
                3 new long-term studies push effectiveness from CE 71 to CE 86.
              </div>
              <Photo h={140} tone="moss" caption="Created pond cluster — Cumbrian fells" style={{ borderRadius: 4, marginBottom: 12 }} />
              <span className="text-sm" style={{ color: "var(--forest)", fontWeight: 500 }}>Read the synthesis &rarr;</span>
            </div>

            {/* Papers */}
            <div style={{ padding: "8px 32px" }}>
              <div className="eyebrow" style={{ padding: "16px 0 10px" }}>This week&apos;s papers</div>
              {[
                { tag: "NEW", title: "Long-term outcomes of riparian translocation programmes for water voles", meta: "J. Applied Ecology · 14 sites · 2009\u20132024", tone: "sea" as const },
                { tag: "NEW", title: "Mink control efficacy across connected wetland reserves", meta: "Conservation Biology · meta-analysis · n=22", tone: "night" as const },
                { tag: "IUCN", title: "Bombus muscorum reassessed Vulnerable in continental Europe", meta: "IUCN Red List · regional assessment", tone: "sand" as const },
                { tag: "CE", title: "Hedgerow restoration → moved to Likely Beneficial for hazel dormice", meta: "Conservation Evidence · 11 studies", tone: "forest" as const },
              ].map((it, i) => (
                <div key={i} className="row gap-3" style={{ padding: "14px 0", borderTop: "1px solid var(--rule-soft)" }}>
                  <Photo h={56} tone={it.tone} caption="" style={{ width: 80, borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="row gap-2" style={{ marginBottom: 4 }}>
                      <span
                        className="badge mono"
                        style={{
                          background: it.tag === "NEW" ? "var(--forest-tint)" : it.tag === "IUCN" ? "oklch(0.95 0.04 50)" : "oklch(0.93 0.04 140)",
                          color: it.tag === "NEW" ? "var(--forest-deep)" : it.tag === "IUCN" ? "oklch(0.48 0.08 50)" : "oklch(0.42 0.08 140)",
                          borderColor: "transparent",
                          fontSize: 9,
                        }}
                      >
                        {it.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.35, marginBottom: 4 }}>{it.title}</div>
                    <div className="text-xs text-soft mono">{it.meta}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div style={{ padding: "24px 32px", background: "var(--bg)", borderTop: "1px solid var(--rule)" }}>
              <I.Quote size={18} style={{ color: "var(--forest)", marginBottom: 6 }} />
              <div className="serif" style={{ fontSize: 16, lineHeight: 1.4, marginBottom: 8, letterSpacing: "-0.005em" }}>
                &ldquo;Translocation paired with mink control shows the most consistent population recovery for Arvicola amphibius &mdash; 88% effectiveness across 14 long-term studies.&rdquo;
              </div>
              <div className="text-xs text-soft mono">Synthesis &middot; gemma4:e4b &middot; 22 citations validated</div>
            </div>

            {/* CTA */}
            <div style={{ padding: "24px 32px", textAlign: "center", borderTop: "1px solid var(--rule)" }}>
              <span className="btn btn-primary" style={{ display: "inline-flex" }}>Open your dashboard <I.ArrowRight size={13} /></span>
              <div className="text-xs text-soft mono" style={{ marginTop: 16 }}>
                You&apos;re getting this because you watch 5 queries on CEIP.
              </div>
            </div>

            <div style={{ padding: "14px 32px", background: "var(--bg-elev)" }}>
              <div className="row justify-between text-xs text-soft mono">
                <span>&copy; 2026 CEIP &middot; Cornwall, UK</span>
                <span>v2.0.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings rail */}
        <div className="col gap-4">
          <Card>
            <Eyebrow>Schedule</Eyebrow>
            <div className="col gap-3" style={{ marginTop: 14 }}>
              <div>
                <label className="label">Frequency</label>
                <select className="input">
                  <option>Weekly &middot; Mondays</option>
                  <option>Daily</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label className="label">Send time</label>
                <select className="input">
                  <option>07:00 local</option>
                  <option>09:00 local</option>
                  <option>17:00 local</option>
                </select>
              </div>
              <div>
                <label className="label">Timezone</label>
                <select className="input">
                  <option>Europe/London (BST)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <Eyebrow>Sections</Eyebrow>
            <div className="col" style={{ marginTop: 10 }}>
              {([
                ["Top change spotlight", true],
                ["Stat strip", true],
                ["New papers (top 5)", true],
                ["IUCN updates", true],
                ["CE rating changes", true],
                ["Synthesis quote", true],
                ["Project digest", false],
              ] as [string, boolean][]).map(([t, on], i) => (
                <label key={i} className="row justify-between items-center" style={{ padding: "8px 0", borderBottom: i < 6 ? "1px solid var(--rule-soft)" : "none" }}>
                  <span className="text-sm">{t}</span>
                  <input type="checkbox" defaultChecked={on} />
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <Eyebrow>Recipients</Eyebrow>
            <div className="serif" style={{ fontSize: 26, margin: "6px 0", letterSpacing: "-0.02em" }}>1,247</div>
            <div className="text-xs text-soft mono">across 4 watchlists &middot; 89% open rate (last 12 wk)</div>
            <button className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>Manage list</button>
          </Card>
        </div>
      </div>
    </div>
  );
}
