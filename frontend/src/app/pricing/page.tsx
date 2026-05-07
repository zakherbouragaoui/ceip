"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandMark, Eyebrow, Btn } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

const plans = [
  {
    name: "Field",
    price: 0,
    cadence: "Free, forever",
    tagline: "For practitioners exploring the evidence base.",
    cta: "Start free",
    ctaHref: "/register",
    features: [
      "50 evidence queries / month",
      "Conservation Evidence database access",
      "Species lookup (56K species)",
      "Weekly digest email",
      "Cite & export (BibTeX, RIS)",
    ],
    missing: ["Project workspace", "Custom alerts", "Team seats"],
    featured: false,
  },
  {
    name: "Practitioner",
    price: 29,
    cadence: "per month",
    tagline: "For active conservation projects with ongoing evidence needs.",
    cta: "Start 14-day trial",
    ctaHref: "/register",
    features: [
      "Unlimited evidence queries",
      "Up to 10 projects",
      "Custom alerts on species & interventions",
      "TNFD/CSRD report export",
      "Citation manager & shared library",
      "Priority sync with Zotero, Mendeley",
    ],
    missing: ["SSO", "Team seats >3"],
    featured: true,
  },
  {
    name: "Institution",
    price: "Custom",
    cadence: "annual",
    tagline: "For NGOs, universities and consultancies.",
    cta: "Talk to us",
    ctaHref: "/pricing",
    features: [
      "Everything in Practitioner",
      "Unlimited team seats",
      "SSO (SAML, Google, Microsoft)",
      "Private dataset ingestion",
      "TNFD module + audit trail",
      "API access (10K req/day)",
      "Dedicated success lead",
    ],
    missing: [],
    featured: false,
  },
];

const comparison = [
  ["Evidence queries / month", "50", "Unlimited", "Unlimited"],
  ["Projects", "\u2014", "10", "Unlimited"],
  ["Team seats", "1", "3", "Unlimited"],
  ["Custom alerts", "\u2014", "\u2713", "\u2713"],
  ["TNFD/CSRD report", "\u2014", "\u2713", "\u2713"],
  ["SSO (SAML, Azure AD)", "\u2014", "\u2014", "\u2713"],
  ["Private dataset ingestion", "\u2014", "\u2014", "\u2713"],
  ["API access", "100/day", "1K/day", "10K/day"],
  ["Support", "Community", "Email", "Success lead"],
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 56px",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <Link href="/" className="row items-center gap-3" style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
          <BrandMark />
          <div className="serif" style={{ fontSize: 20 }}>CEIP</div>
        </Link>
        <nav className="row gap-6 text-sm text-soft">
          <Link href="/" style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}>Platform</Link>
          <span style={{ color: "var(--ink)" }}>Pricing</span>
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
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 56px 32px", textAlign: "center" }}>
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="serif" style={{ fontSize: 56, margin: "12px 0 16px", letterSpacing: "-0.025em" }}>
          Pay for the work, <em style={{ color: "var(--forest)" }}>not the access.</em>
        </h1>
        <p className="text-soft" style={{ fontSize: 17, maxWidth: 560, margin: "0 auto" }}>
          Free for individual practitioners. We charge teams that need workspace, alerts and the TNFD module.
        </p>

        <div className="row gap-2 items-center justify-center" style={{ marginTop: 36 }}>
          <span className={annual ? "text-soft text-sm" : "text-sm"} style={{ fontWeight: 500 }}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 999,
              background: annual ? "var(--forest)" : "var(--rule)",
              position: "relative",
              transition: "background .15s",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: annual ? 23 : 3,
                width: 18,
                height: 18,
                background: "var(--paper)",
                borderRadius: "50%",
                transition: "left .15s",
              }}
            />
          </button>
          <span className={annual ? "text-sm" : "text-soft text-sm"} style={{ fontWeight: 500 }}>Annual</span>
          <span className="badge" style={{ marginLeft: 4, background: "oklch(0.93 0.04 155)", color: "oklch(0.32 0.06 155)", borderColor: "transparent" }}>Save 20%</span>
        </div>
      </section>

      {/* Plans */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 56px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {plans.map((p, i) => {
            const price = typeof p.price === "number" ? (annual ? Math.round(p.price * 0.8) : p.price) : p.price;
            return (
              <div
                key={i}
                className="card"
                style={{
                  padding: 32,
                  position: "relative",
                  background: p.featured ? "var(--forest-deep)" : "var(--paper)",
                  color: p.featured ? "oklch(0.95 0.015 155)" : "var(--ink)",
                  borderColor: p.featured ? "var(--forest-deep)" : "var(--rule)",
                }}
              >
                {p.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      right: 24,
                      background: "var(--moss)",
                      color: "oklch(0.18 0.02 155)",
                      padding: "4px 12px",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      borderRadius: 999,
                      fontWeight: 600,
                    }}
                  >
                    Most chosen
                  </div>
                )}
                <Eyebrow style={{ color: p.featured ? "oklch(0.7 0.04 155)" : "var(--ink-mute)" }}>{p.name}</Eyebrow>
                <div className="row items-end gap-2" style={{ margin: "14px 0 6px" }}>
                  <div className="serif" style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.025em" }}>
                    {typeof price === "number" ? `$${price}` : price}
                  </div>
                  <div className="text-sm" style={{ marginBottom: 8, opacity: 0.7 }}>{p.cadence}</div>
                </div>
                <div className="text-sm" style={{ opacity: 0.75, marginBottom: 24, minHeight: 40 }}>{p.tagline}</div>
                <Link
                  href={p.ctaHref}
                  className={`btn ${p.featured ? "" : "btn-outline"}`}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: 12,
                    textDecoration: "none",
                    background: p.featured ? "var(--moss)" : undefined,
                    color: p.featured ? "oklch(0.18 0.02 155)" : undefined,
                    fontWeight: 600,
                  }}
                >
                  {p.cta}
                </Link>
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid " + (p.featured ? "oklch(0.4 0.04 155)" : "var(--rule)") }}>
                  <div className="eyebrow" style={{ color: p.featured ? "oklch(0.7 0.04 155)" : "var(--ink-mute)", marginBottom: 14 }}>Includes</div>
                  <div className="col gap-2">
                    {p.features.map((f, j) => (
                      <div key={j} className="row gap-2 items-start text-sm">
                        <I.Check size={14} style={{ color: p.featured ? "var(--moss)" : "var(--forest)", marginTop: 3, flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                    {p.missing.map((f, j) => (
                      <div key={j} className="row gap-2 items-start text-sm" style={{ opacity: 0.5 }}>
                        <I.X size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 56px 96px" }}>
        <div className="card" style={{ padding: 40, background: "var(--bg-elev)" }}>
          <div className="row justify-between items-center" style={{ marginBottom: 24 }}>
            <div>
              <Eyebrow>Compare in detail</Eyebrow>
              <h2 className="serif" style={{ fontSize: 28, margin: "6px 0 0", letterSpacing: "-0.02em" }}>What&apos;s in each plan</h2>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th style={{ textAlign: "left", padding: "12px 0", fontWeight: 500, color: "var(--ink-mute)" }}>Feature</th>
                {plans.map((p) => (
                  <th key={p.name} style={{ padding: "12px 16px", fontWeight: 500 }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                  <td style={{ padding: "14px 0", color: "var(--ink-soft)" }}>{row[0]}</td>
                  {row.slice(1).map((v, j) => (
                    <td key={j} style={{ padding: "14px 16px", textAlign: "center", fontFamily: v === "\u2713" || v === "\u2014" ? "var(--font-sans)" : "var(--font-mono)", fontSize: 13 }}>
                      {v === "\u2713" ? (
                        <I.Check size={16} style={{ color: "var(--forest)" }} />
                      ) : v === "\u2014" ? (
                        <span style={{ color: "var(--ink-mute)" }}>&mdash;</span>
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
