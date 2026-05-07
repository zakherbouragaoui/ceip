import Link from "next/link";
import { BrandMark, Card, Eyebrow, Badge, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>{n}</div>
      <div className="text-xs mono text-soft" style={{ marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
    </div>
  );
}

function Pillar({ n, title, body, icon }: { n: string; title: string; body: string; icon: React.ReactNode }) {
  return (
    <Card>
      <div className="row justify-between items-start" style={{ marginBottom: 28 }}>
        <div className="mono text-xs text-soft">{n}</div>
        <div style={{ width: 36, height: 36, background: "var(--forest-tint)", color: "var(--forest)", display: "grid", placeItems: "center", borderRadius: 6 }}>{icon}</div>
      </div>
      <div className="serif" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 12, letterSpacing: "-0.01em" }}>{title}</div>
      <div className="text-sm text-soft">{body}</div>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Top nav */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 56px", borderBottom: "1px solid var(--rule)",
        position: "sticky", top: 0, background: "oklch(0.97 0.008 85 / 0.85)",
        backdropFilter: "blur(10px)", zIndex: 10,
      }}>
        <div className="row items-center gap-3">
          <BrandMark />
          <div className="serif" style={{ fontSize: 20 }}>CEIP</div>
        </div>
        <nav className="row gap-6 text-sm text-soft">
          <Link href="/" style={{ cursor: "pointer" }}>Platform</Link>
          <Link href="/pricing" style={{ cursor: "pointer" }}>Pricing</Link>
          <span style={{ cursor: "pointer" }}>Evidence</span>
          <span style={{ cursor: "pointer" }}>Research</span>
          <span style={{ cursor: "pointer" }}>About</span>
        </nav>
        <div className="row gap-2">
          <Link href="/login" className="btn btn-ghost" style={{ textDecoration: "none" }}>Sign in</Link>
          <Link href="/register" className="btn btn-primary" style={{ textDecoration: "none" }}>Start free</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "80px 56px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "center" }}>
          <div>
            <Eyebrow style={{ marginBottom: 20 }}>Living evidence layer &middot; updated weekly</Eyebrow>
            <h1 className="serif" style={{ fontSize: 72, lineHeight: 1.02, margin: "0 0 24px", letterSpacing: "-0.025em" }}>
              Conservation decisions, <em style={{ color: "var(--forest)" }}>grounded in evidence.</em>
            </h1>
            <p style={{ fontSize: 18, color: "var(--ink-soft)", maxWidth: 540, lineHeight: 1.55 }}>
              CEIP synthesises 17,934 peer-reviewed studies and 3,891 Conservation Evidence interventions into cited, AI-assisted guidance &mdash; for the practitioners actually doing the work.
            </p>
            <div className="row gap-3" style={{ marginTop: 36 }}>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
                Start with the evidence base <I.ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className="btn btn-outline btn-lg" style={{ textDecoration: "none" }}>
                See a live dashboard
              </Link>
            </div>
            <div className="row gap-6" style={{ marginTop: 44, paddingTop: 28, borderTop: "1px solid var(--rule)" }}>
              <Stat n="56,198" l="species indexed" />
              <Stat n="17,934" l="papers, weekly +103" />
              <Stat n="3,891" l="CE interventions" />
              <Stat n="80%" l="eval gold-set pass" />
            </div>
          </div>
          <div style={{ position: "relative", height: 540 }}>
            <Photo h={540} tone="forest" caption="Lowland heath at dawn" style={{ borderRadius: 14 }} />
            <Card style={{ position: "absolute", top: 32, right: -24, width: 320, boxShadow: "0 24px 48px oklch(0.18 0.02 155 / 0.18)" }}>
              <Eyebrow>Synthesis</Eyebrow>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.25, margin: "6px 0 10px" }}>
                Translocation + mink control: <em style={{ color: "var(--forest)" }}>strong evidence</em>
              </div>
              <Badge tone="strong" dot>Beneficial &middot; CE 88</Badge>
              <div className="text-xs text-soft mono" style={{ marginTop: 8 }}>14 cited studies &middot; validated</div>
            </Card>
            <Card style={{ position: "absolute", bottom: -16, right: 32, width: 260, boxShadow: "0 24px 48px oklch(0.18 0.02 155 / 0.18)" }}>
              <div className="row items-center gap-3">
                <div style={{ width: 44, height: 44, background: "var(--forest-tint)", display: "grid", placeItems: "center", borderRadius: 6 }}>
                  <I.Leaf size={20} style={{ color: "var(--forest)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 15 }}>Arvicola amphibius</div>
                  <div className="text-xs text-soft">23 interventions &middot; NT</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section style={{ padding: "96px 56px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1.3fr", gap: 56, marginBottom: 56 }}>
          <Eyebrow>The platform</Eyebrow>
          <h2 className="serif" style={{ fontSize: 44, lineHeight: 1.1, margin: 0, letterSpacing: "-0.02em" }}>
            Three layers, one decision.<br />
            <span style={{ color: "var(--ink-mute)" }}>From a 17K-paper evidence base to a recommendation you can defend in a funder review.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          <Pillar n="01" title="Living evidence layer" icon={<I.Database size={20} />}
            body="A weekly ingestion agent pulls new studies from CORE, OpenAlex, IUCN and Conservation Evidence. Classified, embedded and cited." />
          <Pillar n="02" title="Hybrid retrieval RAG" icon={<I.Layers size={20} />}
            body="BM25 + nomic-embed vectors + SQL routing. Gemma 4 synthesises what's actually relevant, with citations validated against the source schema." />
          <Pillar n="03" title="Practitioner workspace" icon={<I.Compass size={20} />}
            body="Project files, custom alerts, TNFD/CSRD reports, citation export. The workflow surface that turns evidence into a decision." />
        </div>
      </section>

      {/* Big quote */}
      <section style={{ background: "var(--forest-deep)", color: "oklch(0.95 0.015 155)", padding: "80px 56px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <I.Quote size={32} style={{ color: "var(--moss)", marginBottom: 20 }} />
          <blockquote className="serif" style={{ fontSize: 38, lineHeight: 1.25, margin: 0, letterSpacing: "-0.015em" }}>
            &ldquo;The honest answer used to be &lsquo;we read what we could find&rsquo;. CEIP turned that into a defensible audit trail &mdash; every recommendation now points back to a paper.&rdquo;
          </blockquote>
          <div className="row gap-3 items-center" style={{ marginTop: 32 }}>
            <Photo h={48} tone="moss" style={{ width: 48, borderRadius: "50%" }} />
            <div>
              <div style={{ fontSize: 15 }}>Dr. Robin Aldridge-Sutton</div>
              <div className="text-sm" style={{ color: "oklch(0.7 0.03 155)" }}>Reserves manager &middot; Wildlands Trust</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 56px", borderTop: "1px solid var(--rule)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <h2 className="serif" style={{ fontSize: 56, margin: 0, letterSpacing: "-0.025em" }}>
            Stop guessing. <em style={{ color: "var(--forest)" }}>Start citing.</em>
          </h2>
          <p style={{ fontSize: 18, color: "var(--ink-soft)", marginTop: 16, marginBottom: 32 }}>
            Free for individual practitioners. 14-day trial on Practitioner. No card needed.
          </p>
          <div className="row gap-3 justify-center">
            <Link href="/register" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>Start free <I.ArrowRight size={16} /></Link>
            <Link href="/pricing" className="btn btn-outline btn-lg" style={{ textDecoration: "none" }}>See pricing</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "48px 56px 56px", borderTop: "1px solid var(--rule)", background: "var(--bg-elev)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 48 }}>
          <div>
            <div className="row items-center gap-3" style={{ marginBottom: 16 }}>
              <BrandMark />
              <div className="serif" style={{ fontSize: 20 }}>CEIP</div>
            </div>
            <div className="text-sm text-soft" style={{ maxWidth: 280 }}>
              Conservation Evidence Intelligence Platform. A living layer between practitioners and the evidence base.
            </div>
          </div>
          {[
            ["Product", ["Platform", "Evidence", "Pricing", "Changelog"]],
            ["Resources", ["Docs", "API", "Eval benchmarks", "Status"]],
            ["Company", ["About", "Research", "Contact"]],
            ["Legal", ["Terms", "Privacy", "Data ethics"]],
          ].map(([h, items]) => (
            <div key={h as string}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>{h as string}</div>
              <div className="col gap-2 text-sm">{(items as string[]).map(x => <span key={x} className="text-soft" style={{ cursor: "pointer" }}>{x}</span>)}</div>
            </div>
          ))}
        </div>
        <div className="row justify-between" style={{ maxWidth: 1280, margin: "40px auto 0", paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
          <div className="text-xs text-soft mono">&copy; 2026 CEIP &middot; Built in Cornwall, UK</div>
          <div className="text-xs text-soft mono">v2.0.0</div>
        </div>
      </footer>
    </div>
  );
}
