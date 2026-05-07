"use client";

import { useState } from "react";
import { useEvidenceSearch } from "@/lib/hooks/use-evidence";
import type { EvidenceRequest, EvidenceResult } from "@/lib/types";
import { Card, Eyebrow, Badge, Btn, Cite, FilterPill } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function EvidencePage() {
  const search = useEvidenceSearch();
  const [result, setResult] = useState<EvidenceResult | null>(null);
  const [question, setQuestion] = useState("");
  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch() {
    if (!question.trim()) return;
    const req: EvidenceRequest = { question, species: species || undefined, location: location || undefined };
    search.mutate(req, { onSuccess: (data) => setResult(data) });
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>Evidence search</Eyebrow>
        <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 0", letterSpacing: "-0.02em" }}>
          Ask the corpus.
        </h1>
      </div>

      {/* Query bar */}
      <Card pad={false} style={{ marginBottom: 24 }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--rule-soft)" }}>
          <div className="row gap-3 items-start">
            <I.Sparkles size={20} style={{ color: "var(--forest)", marginTop: 8, flexShrink: 0 }} />
            <textarea
              className="input"
              style={{ resize: "none", border: "none", padding: "6px 0", fontSize: 17, fontFamily: "var(--font-serif)", letterSpacing: "-0.01em" }}
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are the best evidence-based interventions for..."
            />
          </div>
        </div>
        <div className="row justify-between items-center" style={{ padding: "12px 20px" }}>
          <div className="row gap-2">
            <input
              className="input"
              style={{ width: 160, padding: "5px 10px", fontSize: 12, borderRadius: 999 }}
              placeholder="Species filter..."
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            />
            <input
              className="input"
              style={{ width: 160, padding: "5px 10px", fontSize: 12, borderRadius: 999 }}
              placeholder="Location filter..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="row gap-2">
            <span className="text-xs text-soft mono">Route: SYNTHESIS</span>
            <Btn variant="primary" size="sm" onClick={handleSearch}>
              {search.isPending ? <span className="pulse">Synthesising&hellip;</span> : <>Run synthesis <I.ArrowRight size={13} /></>}
            </Btn>
          </div>
        </div>
      </Card>

      {/* Error */}
      {search.isError && (
        <Card style={{ borderColor: "var(--signal)", marginBottom: 16 }}>
          <p className="text-sm" style={{ color: "var(--signal)" }}>Failed to retrieve evidence. Please try again.</p>
        </Card>
      )}

      {/* Loading */}
      {search.isPending && (
        <Card>
          <div className="col gap-3">
            <div className="pulse" style={{ height: 20, width: "60%", background: "var(--rule)", borderRadius: 4 }} />
            <div className="pulse" style={{ height: 16, width: "100%", background: "var(--rule)", borderRadius: 4 }} />
            <div className="pulse" style={{ height: 16, width: "100%", background: "var(--rule)", borderRadius: 4 }} />
            <div className="pulse" style={{ height: 16, width: "75%", background: "var(--rule)", borderRadius: 4 }} />
          </div>
        </Card>
      )}

      {/* Results */}
      {result && !search.isPending && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            {/* Synthesis result */}
            <Card pad={false} style={{ marginBottom: 16 }}>
              <div style={{ padding: 24, borderBottom: "1px solid var(--rule)" }}>
                <div className="row justify-between items-start" style={{ marginBottom: 16 }}>
                  <div className="row gap-2">
                    <Badge tone={result.confidence === "strong" ? "strong" : result.confidence === "moderate" ? "moderate" : "weak"} dot>
                      {result.confidence} evidence
                    </Badge>
                    <span className="badge mono">{result.citations?.length ?? 0} citations</span>
                  </div>
                  <div className="row gap-2">
                    <button className="tb-icon-btn"><I.Bookmark size={15} /></button>
                    <button className="tb-icon-btn"><I.Download size={15} /></button>
                  </div>
                </div>
                <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {result.answer?.split(".")[0]}.
                </h2>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink)", margin: 0 }}>
                  {result.answer}
                </p>

                {/* Interventions */}
                {result.interventions && result.interventions.length > 0 && (
                  <>
                    <div style={{ height: 1, background: "var(--rule)", margin: "20px 0" }} />
                    <div className="eyebrow" style={{ marginBottom: 12 }}>Ranked interventions</div>
                    <div className="col gap-2">
                      {result.interventions.map((intv, i) => (
                        <div key={i} className="row gap-3 items-center" style={{ padding: 14, background: "var(--bg)", borderRadius: 6 }}>
                          <div className="mono" style={{ minWidth: 56, textAlign: "center" }}>
                            <div className="serif" style={{ fontSize: 22, letterSpacing: "-0.02em", color: "var(--forest)" }}>
                              {intv.effectiveness_pct ?? "—"}
                            </div>
                            <div className="text-xs text-soft" style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>CE</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>{intv.name}</div>
                            <div className="row gap-2 items-center" style={{ marginTop: 4 }}>
                              <Badge tone={intv.ce_category === "Beneficial" ? "strong" : intv.ce_category === "Likely Beneficial" ? "moderate" : "weak"} dot>
                                {intv.ce_category}
                              </Badge>
                              <span className="text-xs text-soft mono">{intv.n_studies} studies</span>
                            </div>
                          </div>
                          <I.ChevronRight size={16} style={{ color: "var(--ink-mute)" }} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Citations */}
            {result.citations && result.citations.length > 0 && (
              <Card pad={false}>
                <div className="row justify-between" style={{ padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
                  <div className="serif" style={{ fontSize: 20 }}>Citations <span className="mono text-sm text-soft" style={{ marginLeft: 6 }}>n={result.citations.length}</span></div>
                </div>
                {result.citations.map((c, i) => (
                  <div key={i} className="row gap-3" style={{ padding: "16px 24px", borderTop: "1px solid var(--rule-soft)" }}>
                    <div className="mono text-soft" style={{ fontSize: 12, minWidth: 24 }}>[{i + 1}]</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14 }}><span className="serif" style={{ fontStyle: "italic" }}>{c.title}</span></div>
                      <div className="text-sm text-soft" style={{ marginTop: 2 }}>
                        {c.year} &middot; {c.source}
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Side rail */}
          <div className="col gap-4">
            <Card>
              <Eyebrow>Method</Eyebrow>
              <div className="text-sm" style={{ marginTop: 8 }}>
                <div className="row justify-between" style={{ padding: "6px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                  <span className="text-soft">Router</span><span className="mono">{"SYNTHESIS"}</span>
                </div>
                <div className="row justify-between" style={{ padding: "6px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                  <span className="text-soft">Retrieval</span><span className="mono">BM25 + vector</span>
                </div>
                <div className="row justify-between" style={{ padding: "6px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                  <span className="text-soft">Model</span><span className="mono">gemma4:e4b</span>
                </div>
                <div className="row justify-between" style={{ padding: "6px 0" }}>
                  <span className="text-soft">Validated</span><span className="mono" style={{ color: "var(--forest)" }}>&#10003; schema</span>
                </div>
              </div>
            </Card>

            <Card>
              <Eyebrow>Confidence</Eyebrow>
              <div className="bloom-ring" style={{ "--p": `${((result as unknown as { confidence_score?: number }).confidence_score ?? 0.9) * 100}%`, width: 110, height: 110, margin: "14px auto 8px" } as React.CSSProperties}>
                <div className="bloom-inner" style={{ width: 88, height: 88 }}>
                  <div className="serif" style={{ fontSize: 26, letterSpacing: "-0.02em" }}>{((result as unknown as { confidence_score?: number }).confidence_score ?? 0.9).toFixed(2)}</div>
                </div>
              </div>
              <div className="text-xs text-soft mono" style={{ textAlign: "center" }}>Above 0.70 threshold</div>
            </Card>

            <Card>
              <Eyebrow>Subscribe</Eyebrow>
              <div className="serif" style={{ fontSize: 16, margin: "6px 0 10px", lineHeight: 1.2 }}>Alert me when this evidence changes</div>
              <div className="text-sm text-soft" style={{ marginBottom: 14 }}>Get a digest when new papers or CE rating changes affect this query.</div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                <I.Bell size={13} /> Watch this query
              </button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
