"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { BrandMark, Eyebrow, Btn, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/onboarding");
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
      {/* Left: form */}
      <div style={{ padding: "40px 64px", display: "flex", flexDirection: "column" }}>
        <Link href="/" className="row items-center gap-3" style={{ textDecoration: "none", color: "inherit" }}>
          <BrandMark />
          <div className="serif" style={{ fontSize: 20 }}>CEIP</div>
        </Link>

        <div style={{ flex: 1, display: "grid", placeItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <Eyebrow>Create account</Eyebrow>
            <h1 className="serif" style={{ fontSize: 40, margin: "8px 0 8px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Start with the evidence base.
            </h1>
            <p className="text-soft" style={{ marginBottom: 28 }}>Free for individual practitioners. No card required.</p>

            {/* SSO */}
            <div className="col gap-2" style={{ marginBottom: 20 }}>
              <button className="btn btn-outline" style={{ justifyContent: "flex-start", gap: 12, padding: "11px 14px" }}>
                <span style={{ width: 18, height: 18, background: "oklch(0.6 0.18 28)", borderRadius: 3 }} />
                Continue with Google
              </button>
              <button className="btn btn-outline" style={{ justifyContent: "flex-start", gap: 12, padding: "11px 14px" }}>
                <span style={{ width: 18, height: 18, background: "oklch(0.55 0.13 240)", borderRadius: 3 }} />
                Continue with Microsoft
              </button>
              <button className="btn btn-outline" style={{ justifyContent: "flex-start", gap: 12, padding: "11px 14px" }}>
                <span style={{ width: 18, height: 18, background: "oklch(0.6 0.16 110)", borderRadius: 3 }} />
                Continue with ORCID
              </button>
            </div>
            <div className="row items-center gap-3" style={{ margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
              <div className="text-xs mono text-soft">OR</div>
              <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "oklch(0.95 0.04 25)", color: "var(--signal)", borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Full name</label>
                <input
                  className="input"
                  placeholder="Dr. Elena Marsh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Work email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="elena@wildlandstrust.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <label className="row gap-2 items-start text-sm text-soft" style={{ marginTop: 14, marginBottom: 14 }}>
                <input type="checkbox" defaultChecked style={{ marginTop: 3 }} />
                <span>Send me the weekly evidence digest. Unsubscribe in one click.</span>
              </label>

              <Btn variant="primary" style={{ width: "100%", justifyContent: "center", marginTop: 12, padding: 12 }} type="submit">
                {loading ? "Creating account…" : <>Create account <I.ArrowRight size={16} /></>}
              </Btn>
            </form>

            <div className="text-sm text-soft" style={{ marginTop: 24, textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--forest)", fontWeight: 500 }}>Sign in</Link>
            </div>
          </div>
        </div>

        <div className="text-xs text-soft mono">&copy; 2026 CEIP</div>
      </div>

      {/* Right: imagery */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Photo h={0} tone="forest" caption="Atlantic oakwood — Wistman's Wood, Devon"
          style={{ position: "absolute", inset: 0, height: "100%" }} />
        <div style={{ position: "absolute", bottom: 56, left: 56, right: 56, color: "oklch(0.97 0.015 155)" }}>
          <I.Quote size={28} style={{ color: "var(--moss)", marginBottom: 16 }} />
          <blockquote className="serif" style={{ fontSize: 26, lineHeight: 1.3, margin: 0, letterSpacing: "-0.01em" }}>
            &ldquo;We replaced &lsquo;we read what we could find&rsquo; with an audit trail. Every recommendation now points back to a paper.&rdquo;
          </blockquote>
          <div className="text-sm" style={{ marginTop: 16, opacity: 0.8 }}>
            Dr. Robin Aldridge-Sutton &mdash; Reserves manager, Wildlands Trust
          </div>
        </div>
      </div>
    </div>
  );
}
