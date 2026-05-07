"use client";

import { use } from "react";
import Link from "next/link";
import { useQueryResult } from "@/lib/hooks/use-evidence";
import { Card, Eyebrow, Badge, Btn } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function EvidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: result, isLoading, isError } = useQueryResult(id);

  return (
    <div>
      <div className="row gap-3 items-center" style={{ marginBottom: 24 }}>
        <Link href="/evidence">
          <button className="tb-icon-btn">
            <I.ArrowRight size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
        </Link>
        <h1 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: "-0.02em" }}>Evidence Result</h1>
      </div>

      {isLoading && (
        <Card>
          <div className="col gap-3">
            <div className="pulse" style={{ height: 20, width: "40%", background: "var(--rule)", borderRadius: 4 }} />
            <div className="pulse" style={{ height: 16, width: "100%", background: "var(--rule)", borderRadius: 4 }} />
            <div className="pulse" style={{ height: 16, width: "100%", background: "var(--rule)", borderRadius: 4 }} />
            <div className="pulse" style={{ height: 16, width: "75%", background: "var(--rule)", borderRadius: 4 }} />
          </div>
        </Card>
      )}

      {isError && (
        <Card style={{ borderColor: "var(--signal)" }}>
          <p className="text-sm" style={{ color: "var(--signal)" }}>Result not found or has expired.</p>
        </Card>
      )}

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <Card>
            <div className="row gap-2" style={{ marginBottom: 16 }}>
              <Badge tone={result.confidence === "strong" ? "strong" : result.confidence === "moderate" ? "moderate" : "weak"} dot>
                {result.confidence} evidence
              </Badge>
              <span className="badge mono">{result.citations?.length ?? 0} citations</span>
            </div>
            <h2 className="serif" style={{ fontSize: 28, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {result.answer?.split(".")[0]}.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink)", margin: 0 }}>{result.answer}</p>

            {result.citations && result.citations.length > 0 && (
              <>
                <div style={{ height: 1, background: "var(--rule)", margin: "20px 0" }} />
                <div className="eyebrow" style={{ marginBottom: 12 }}>Citations</div>
                {result.citations.map((c, i) => (
                  <div key={i} className="row gap-3" style={{ padding: "10px 0", borderTop: "1px solid var(--rule-soft)" }}>
                    <div className="mono text-soft" style={{ fontSize: 12, minWidth: 24 }}>[{i + 1}]</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14 }}><span className="serif" style={{ fontStyle: "italic" }}>{c.title}</span></div>
                      <div className="text-sm text-soft" style={{ marginTop: 2 }}>{c.year ?? "—"} &middot; {c.source}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </Card>

          <Card>
            <Eyebrow>Method</Eyebrow>
            <div className="text-sm" style={{ marginTop: 8 }}>
              <div className="row justify-between" style={{ padding: "6px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <span className="text-soft">Router</span><span className="mono">SYNTHESIS</span>
              </div>
              <div className="row justify-between" style={{ padding: "6px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <span className="text-soft">Retrieval</span><span className="mono">BM25 + vector</span>
              </div>
              <div className="row justify-between" style={{ padding: "6px 0" }}>
                <span className="text-soft">Model</span><span className="mono">gemma4:e4b</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
