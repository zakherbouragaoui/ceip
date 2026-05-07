"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { BrandMark, Card, Eyebrow, Btn, ChipBtn } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

const steps = ["Your work", "Focus areas", "First project", "Connect tools"];

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ padding: "20px 56px", borderBottom: "1px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="row items-center gap-3">
          <BrandMark />
          <div className="serif" style={{ fontSize: 20 }}>CEIP</div>
        </div>
        <div className="text-sm text-soft">Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</div>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 32px" }}>
        {/* Stepper */}
        <div className="row items-center gap-3" style={{ marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div className="row items-center gap-2" style={{ opacity: i <= step ? 1 : 0.4 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: i <= step ? "var(--forest)" : "var(--rule)",
                    color: i <= step ? "oklch(0.97 0.015 155)" : "var(--ink-mute)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {i < step ? <I.Check size={12} /> : i + 1}
                </div>
                <div className="text-sm" style={{ fontWeight: i === step ? 500 : 400 }}>{s}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < step ? "var(--forest)" : "var(--rule)" }} />
              )}
            </div>
          ))}
        </div>

        <Card>
          {step === 0 && (
            <>
              <Eyebrow>Step 01</Eyebrow>
              <h2 className="serif" style={{ fontSize: 32, margin: "6px 0 8px", letterSpacing: "-0.02em" }}>
                What kind of work do you do?
              </h2>
              <p className="text-soft" style={{ marginBottom: 24 }}>
                This shapes which evidence we surface first. You can change it later.
              </p>
              <div className="col gap-2">
                {[
                  "Reserve manager / field practitioner",
                  "Researcher / academic",
                  "Consultant / advisory",
                  "NGO programme lead",
                  "Policy or government",
                  "Student",
                ].map((r, i) => (
                  <label key={i} className="row gap-3 items-center" style={{ padding: 14, border: "1px solid var(--rule)", borderRadius: 6, cursor: "pointer" }}>
                    <input type="radio" name="role" defaultChecked={i === 0} />
                    <div style={{ fontSize: 14 }}>{r}</div>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Eyebrow>Step 02</Eyebrow>
              <h2 className="serif" style={{ fontSize: 32, margin: "6px 0 8px", letterSpacing: "-0.02em" }}>
                Which habitats and taxa?
              </h2>
              <p className="text-soft" style={{ marginBottom: 24 }}>
                Pick everything that&apos;s relevant. We&apos;ll prioritise alerts accordingly.
              </p>
              <div style={{ marginBottom: 18 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Habitats</div>
                <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                  {["Lowland heath", "Saltmarsh", "Atlantic oakwood", "Chalk grassland", "Riparian", "Peatland", "Coastal shingle", "Reedbed", "Mosaic farmland"].map((h, i) => (
                    <ChipBtn key={i} active={i < 3}>{h}</ChipBtn>
                  ))}
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Taxa</div>
                <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                  {["Mammals", "Birds", "Reptiles", "Amphibians", "Invertebrates", "Fish", "Plants", "Lichens & fungi"].map((h, i) => (
                    <ChipBtn key={i} active={i < 4}>{h}</ChipBtn>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Eyebrow>Step 03</Eyebrow>
              <h2 className="serif" style={{ fontSize: 32, margin: "6px 0 8px", letterSpacing: "-0.02em" }}>
                Set up your first project.
              </h2>
              <p className="text-soft" style={{ marginBottom: 24 }}>
                You can skip this and start with the evidence search instead.
              </p>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Project name</label>
                <input className="input" defaultValue="Bodmin Heath Restoration" />
              </div>
              <div className="row gap-3" style={{ marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Habitat</label>
                  <select className="input">
                    <option>Lowland heath</option>
                    <option>Saltmarsh</option>
                    <option>Atlantic oakwood</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Area</label>
                  <input className="input" defaultValue="218 ha" />
                </div>
              </div>
              <div>
                <label className="label">Priority species (comma separated)</label>
                <input className="input" defaultValue="Calluna vulgaris, Lacerta agilis, Caprimulgus europaeus" />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Eyebrow>Step 04</Eyebrow>
              <h2 className="serif" style={{ fontSize: 32, margin: "6px 0 8px", letterSpacing: "-0.02em" }}>
                Connect your tools.
              </h2>
              <p className="text-soft" style={{ marginBottom: 24 }}>
                Pull citations, occurrence data and team identity into your workspace.
              </p>
              <div className="col gap-2">
                {["ORCID", "Zotero", "IUCN Red List", "GBIF", "Google Workspace"].map((t, i) => (
                  <div key={i} className="row items-center justify-between" style={{ padding: 14, border: "1px solid var(--rule)", borderRadius: 6 }}>
                    <div className="row items-center gap-3">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          background: "var(--forest-tint)",
                          borderRadius: 4,
                          display: "grid",
                          placeItems: "center",
                          color: "var(--forest)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {t.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 14 }}>{t}</div>
                    </div>
                    <button className="btn btn-outline btn-sm">Connect</button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="row justify-between" style={{ marginTop: 32 }}>
            <button className="btn btn-ghost" onClick={() => (step > 0 ? setStep(step - 1) : router.push("/"))}>
              Back
            </button>
            <div className="row gap-2">
              {step === 3 && (
                <button className="btn btn-ghost" onClick={() => router.push("/dashboard")}>
                  Skip for now
                </button>
              )}
              <Btn variant="primary" onClick={() => (step < 3 ? setStep(step + 1) : router.push("/dashboard"))}>
                {step < 3 ? "Continue" : "Enter workspace"} <I.ArrowRight size={16} />
              </Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
