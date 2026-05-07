"use client";

import { Card, Eyebrow, Btn } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function BillingPage() {
  return (
    <div>
      <Eyebrow>Billing</Eyebrow>
      <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 32px", letterSpacing: "-0.02em" }}>Subscription &amp; billing</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Current plan */}
        <Card style={{ background: "var(--forest-deep)", color: "oklch(0.95 0.015 155)", borderColor: "var(--forest-deep)" }}>
          <div className="row justify-between items-start" style={{ marginBottom: 28 }}>
            <div>
              <Eyebrow style={{ color: "oklch(0.7 0.04 155)" }}>Current plan</Eyebrow>
              <div className="serif" style={{ fontSize: 32, marginTop: 6, letterSpacing: "-0.02em" }}>Practitioner</div>
            </div>
            <span className="badge" style={{ background: "var(--moss)", color: "oklch(0.18 0.02 155)", borderColor: "transparent" }}>Active</span>
          </div>
          <div className="row gap-6" style={{ marginBottom: 24 }}>
            <div>
              <div className="serif" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>$29</div>
              <div className="text-xs mono" style={{ opacity: 0.7 }}>per month</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>3 / 3</div>
              <div className="text-xs mono" style={{ opacity: 0.7 }}>seats used</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>4 / 10</div>
              <div className="text-xs mono" style={{ opacity: 0.7 }}>projects</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>247</div>
              <div className="text-xs mono" style={{ opacity: 0.7 }}>queries this mo.</div>
            </div>
          </div>
          <div className="row gap-2">
            <button className="btn" style={{ background: "var(--moss)", color: "oklch(0.18 0.02 155)", fontWeight: 600 }}>Upgrade to Institution</button>
            <button className="btn btn-ghost" style={{ color: "oklch(0.85 0.018 155)" }}>Manage seats</button>
          </div>
          <div className="text-xs mono" style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid oklch(0.4 0.04 155)", opacity: 0.7 }}>
            Next renewal &middot; 14 May 2026 &middot; auto-renew on
          </div>
        </Card>

        {/* Payment method */}
        <Card>
          <Eyebrow>Payment method</Eyebrow>
          <div
            style={{
              background: "linear-gradient(135deg, oklch(0.32 0.05 155), oklch(0.45 0.08 140))",
              color: "oklch(0.97 0.015 155)",
              borderRadius: 8,
              padding: 18,
              margin: "14px 0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <I.CreditCard size={20} style={{ marginBottom: 32 }} />
            <div className="mono" style={{ fontSize: 16, letterSpacing: "0.18em" }}>&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4127</div>
            <div className="row justify-between" style={{ marginTop: 12, fontSize: 11, fontFamily: "var(--font-mono)", opacity: 0.85 }}>
              <span>EXP 04 / 28</span>
              <span>VISA</span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }}>Update card</button>
        </Card>
      </div>

      {/* Invoices */}
      <Card pad={false}>
        <div className="row justify-between items-center" style={{ padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
          <Eyebrow>Recent invoices</Eyebrow>
          <Btn variant="outline" size="sm"><I.Download size={13} /> Download all</Btn>
        </div>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rule)", textAlign: "left" }}>
              <th style={{ padding: "12px 24px", fontWeight: 500, color: "var(--ink-mute)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</th>
              <th style={{ padding: "12px 24px", fontWeight: 500, color: "var(--ink-mute)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Description</th>
              <th style={{ padding: "12px 24px", fontWeight: 500, color: "var(--ink-mute)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount</th>
              <th style={{ padding: "12px 24px", fontWeight: 500, color: "var(--ink-mute)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[
              ["14 Apr 2026", "Practitioner — monthly", "$29.00", "Paid"],
              ["14 Mar 2026", "Practitioner — monthly", "$29.00", "Paid"],
              ["14 Feb 2026", "Practitioner — monthly", "$29.00", "Paid"],
              ["14 Jan 2026", "Practitioner — monthly", "$29.00", "Paid"],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="mono text-sm" style={{ padding: "14px 24px" }}>{row[0]}</td>
                <td style={{ padding: "14px 24px" }}>{row[1]}</td>
                <td className="mono" style={{ padding: "14px 24px" }}>{row[2]}</td>
                <td style={{ padding: "14px 24px" }}>
                  <span className="badge" style={{ background: "oklch(0.93 0.04 155)", color: "oklch(0.32 0.06 155)", borderColor: "transparent" }}>{row[3]}</span>
                </td>
                <td style={{ padding: "14px 24px", textAlign: "right" }}>
                  <span className="text-sm" style={{ color: "var(--forest)", cursor: "pointer" }}>View</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
