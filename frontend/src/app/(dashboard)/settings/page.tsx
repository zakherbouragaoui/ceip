"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import api from "@/lib/api";
import { Card, Eyebrow, Btn, Toggle } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [tab, setTab] = useState("account");

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const { data } = await api.put("/api/v1/auth/me", { name, email });
      setUser(data);
      setSaveMsg("Profile updated.");
    } catch {
      setSaveMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg("");
    try {
      await api.put("/api/v1/auth/password", { current_password: currentPw, new_password: newPw });
      setCurrentPw("");
      setNewPw("");
      setPwMsg("Password changed.");
    } catch {
      setPwMsg("Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  }

  const tabs: [string, string][] = [
    ["account", "Account"],
    ["notifications", "Notifications"],
    ["team", "Team & seats"],
    ["data", "Data & privacy"],
    ["api", "API & webhooks"],
    ["danger", "Danger zone"],
  ];

  return (
    <div>
      <Eyebrow>Settings</Eyebrow>
      <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 32px", letterSpacing: "-0.02em" }}>
        Workspace settings
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }}>
        <div className="col gap-1">
          {tabs.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                padding: "8px 12px",
                borderRadius: 5,
                textAlign: "left",
                fontSize: 14,
                background: tab === k ? "var(--bg-elev)" : "transparent",
                color: tab === k ? "var(--ink)" : "var(--ink-soft)",
                fontWeight: tab === k ? 500 : 400,
                border: "none",
                cursor: "pointer",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="col gap-4">
          {tab === "account" && (
            <>
              <Card>
                <Eyebrow>Account</Eyebrow>
                <form onSubmit={handleProfile} style={{ marginTop: 14 }}>
                  <div className="row gap-3" style={{ marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <label className="label">Display name</label>
                      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label">Email</label>
                      <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="row justify-between items-center" style={{ marginTop: 14 }}>
                    {saveMsg && <span className="text-xs text-soft">{saveMsg}</span>}
                    <div style={{ marginLeft: "auto" }}>
                      <Btn variant="primary" size="sm" type="submit">
                        {saving ? "Saving…" : "Save changes"}
                      </Btn>
                    </div>
                  </div>
                </form>
              </Card>

              <Card>
                <Eyebrow>Change password</Eyebrow>
                <form onSubmit={handlePassword} style={{ marginTop: 14 }}>
                  <div className="row gap-3" style={{ marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <label className="label">Current password</label>
                      <input className="input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label">New password</label>
                      <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} />
                    </div>
                  </div>
                  <div className="row justify-between items-center" style={{ marginTop: 14 }}>
                    {pwMsg && <span className="text-xs text-soft">{pwMsg}</span>}
                    <div style={{ marginLeft: "auto" }}>
                      <Btn variant="primary" size="sm" type="submit">
                        {pwSaving ? "Changing…" : "Change password"}
                      </Btn>
                    </div>
                  </div>
                </form>
              </Card>

              <Card>
                <Eyebrow>Appearance</Eyebrow>
                <div className="row gap-3" style={{ marginTop: 14 }}>
                  {(["Light", "Auto", "Dark"] as const).map((m, i) => (
                    <button
                      key={m}
                      className="btn btn-outline"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        padding: 14,
                        flexDirection: "column",
                        gap: 6,
                        background: i === 0 ? "var(--forest-tint)" : undefined,
                        borderColor: i === 0 ? "var(--forest)" : undefined,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 30,
                          background:
                            i === 0
                              ? "oklch(0.97 0.008 85)"
                              : i === 1
                              ? "linear-gradient(90deg, oklch(0.97 0.008 85) 50%, oklch(0.18 0.02 155) 50%)"
                              : "oklch(0.18 0.02 155)",
                          borderRadius: 4,
                          border: "1px solid var(--rule)",
                        }}
                      />
                      {m}
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}

          {tab === "notifications" && (
            <Card>
              <Eyebrow>Notification preferences</Eyebrow>
              <div className="col" style={{ marginTop: 14 }}>
                {([
                  ["Weekly evidence digest", "Top new papers and CE rating changes for your watchlist", true],
                  ["Project alerts", "New evidence relevant to your active projects", true],
                  ["Team activity", "Updates from collaborators on shared projects", false],
                  ["Product updates", "New features and changelog highlights", true],
                  ["Research news", "CEIP research blog and field notes", false],
                ] as [string, string, boolean][]).map(([t, d, on], i) => (
                  <div
                    key={i}
                    className="row justify-between items-center"
                    style={{ padding: "14px 0", borderBottom: i < 4 ? "1px solid var(--rule-soft)" : "none" }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div>
                      <div className="text-xs text-soft" style={{ marginTop: 2 }}>{d}</div>
                    </div>
                    <Toggle defaultOn={on} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === "team" && (
            <Card>
              <div className="row justify-between" style={{ marginBottom: 14 }}>
                <Eyebrow>Team members</Eyebrow>
                <Btn variant="primary" size="sm"><I.Plus size={13} /> Invite</Btn>
              </div>
              <div className="text-sm text-soft">Team management is available on Practitioner and Institution plans.</div>
            </Card>
          )}

          {tab === "data" && (
            <Card>
              <Eyebrow>Data & privacy</Eyebrow>
              <div className="text-sm text-soft" style={{ marginTop: 12, marginBottom: 18 }}>
                CEIP processes evidence queries through our gemma4 + Groq deployment. Your queries are encrypted in transit and never used to train models.
              </div>
              <div className="col gap-2">
                <button className="btn btn-outline" style={{ justifyContent: "space-between" }}>
                  Download all my data <I.Download size={14} />
                </button>
                <button className="btn btn-outline" style={{ justifyContent: "space-between" }}>
                  Export query history (CSV) <I.Download size={14} />
                </button>
                <button className="btn btn-outline" style={{ justifyContent: "space-between" }}>
                  Audit log <I.ArrowUpRight size={14} />
                </button>
              </div>
            </Card>
          )}

          {tab === "api" && (
            <Card>
              <Eyebrow>API access</Eyebrow>
              <div className="text-sm text-soft" style={{ marginTop: 8, marginBottom: 14 }}>
                1,000 requests / day on Practitioner.
              </div>
              <label className="label">API key</label>
              <div className="row gap-2">
                <input className="input mono" readOnly value="ceip_sk_live_8f4a2c1e9b3d7a6f••••••••" style={{ fontSize: 13 }} />
                <button className="btn btn-outline">Copy</button>
                <button className="btn btn-outline">Rotate</button>
              </div>
              <div className="text-xs text-soft mono" style={{ marginTop: 16 }}>
                Usage stats available on Institution plan.
              </div>
            </Card>
          )}

          {tab === "danger" && (
            <Card style={{ borderColor: "oklch(0.7 0.12 25)" }}>
              <div className="eyebrow" style={{ color: "var(--signal)" }}>Danger zone</div>
              <div className="col gap-3" style={{ marginTop: 14 }}>
                <div className="row justify-between items-center" style={{ padding: 14, border: "1px solid var(--rule)", borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Transfer ownership</div>
                    <div className="text-xs text-soft">Hand the workspace over to another admin.</div>
                  </div>
                  <button className="btn btn-outline btn-sm">Transfer</button>
                </div>
                <div className="row justify-between items-center" style={{ padding: 14, border: "1px solid oklch(0.7 0.12 25 / 0.5)", borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--signal)" }}>Delete workspace</div>
                    <div className="text-xs text-soft">All projects, syntheses and citations are removed. Can&apos;t be undone.</div>
                  </div>
                  <button className="btn btn-sm" style={{ background: "var(--signal)", color: "oklch(0.97 0.01 25)" }}>Delete</button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
