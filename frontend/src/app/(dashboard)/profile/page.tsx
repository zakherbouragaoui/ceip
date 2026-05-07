"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Card, Eyebrow, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
    : "?";

  return (
    <div>
      <Eyebrow>Profile</Eyebrow>
      <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 32px", letterSpacing: "-0.02em" }}>Your profile</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
        <Card pad={false}>
          <Photo h={140} tone="forest" caption="Cover photo" />
          <div style={{ padding: 24, position: "relative" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--moss), var(--forest))",
                border: "4px solid var(--paper)",
                display: "grid",
                placeItems: "center",
                color: "oklch(0.97 0.015 155)",
                fontSize: 28,
                fontWeight: 500,
                fontFamily: "var(--font-serif)",
                position: "absolute",
                top: -40,
                left: 24,
              }}
            >
              {initials}
            </div>
            <div style={{ marginTop: 32 }}>
              <div className="serif" style={{ fontSize: 24, letterSpacing: "-0.01em" }}>{user?.name || "User"}</div>
              <div className="text-soft text-sm">{user?.email || "No email"}</div>
              <div className="row gap-2" style={{ marginTop: 14 }}>
                <span className="badge"><I.Map size={11} /> Cornwall, UK</span>
              </div>
              <div className="text-sm" style={{ marginTop: 16, lineHeight: 1.55 }}>
                Conservation practitioner using CEIP to ground decisions in the evidence base.
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>Edit profile</button>
            </div>
          </div>
        </Card>

        <div className="col gap-4">
          <Card>
            <Eyebrow>Activity</Eyebrow>
            <div className="row gap-6" style={{ marginTop: 14 }}>
              <div>
                <div className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>—</div>
                <div className="text-xs text-soft mono">Syntheses run</div>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>—</div>
                <div className="text-xs text-soft mono">Citations exported</div>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>—</div>
                <div className="text-xs text-soft mono">Watchlists active</div>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>—</div>
                <div className="text-xs text-soft mono">Projects led</div>
              </div>
            </div>
          </Card>

          <Card>
            <Eyebrow>Recent saved</Eyebrow>
            <div className="text-sm text-soft" style={{ marginTop: 14 }}>
              No saved evidence yet. Run a synthesis to start building your library.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
