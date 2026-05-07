import React from "react";

/* ===== UI Primitives — matching CEIP design system ===== */

interface BtnProps {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function Btn({
  variant = "primary",
  size,
  children,
  onClick,
  style,
  type = "button",
  disabled,
  className = "",
}: BtnProps) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}${size ? ` btn-${size}` : ""} ${className}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface BadgeProps {
  tone?: "default" | "strong" | "moderate" | "weak";
  children: React.ReactNode;
  dot?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Badge({
  tone = "default",
  children,
  dot,
  style,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`badge${tone !== "default" ? ` badge-${tone}` : ""} ${className}`}
      style={style}
    >
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  pad?: boolean;
  className?: string;
}

export function Card({
  children,
  style,
  onClick,
  pad = true,
  className = "",
}: CardProps) {
  return (
    <div
      className={`card ${className}`}
      style={{ ...(onClick ? { cursor: "pointer" } : {}), ...style }}
      onClick={onClick}
    >
      {pad ? <div className="card-pad">{children}</div> : children}
    </div>
  );
}

interface EyebrowProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Eyebrow({ children, style }: EyebrowProps) {
  return (
    <div className="eyebrow" style={style}>
      {children}
    </div>
  );
}

interface PhotoProps {
  caption?: string;
  h?: number | string;
  tone?: "forest" | "moss" | "sand" | "sea" | "clay" | "stone" | "night";
  style?: React.CSSProperties;
}

const toneGradients: Record<string, [string, string]> = {
  forest: ["oklch(0.32 0.05 155)", "oklch(0.55 0.08 140)"],
  moss: ["oklch(0.45 0.08 140)", "oklch(0.68 0.1 130)"],
  sand: ["oklch(0.65 0.08 80)", "oklch(0.82 0.06 90)"],
  sea: ["oklch(0.4 0.08 215)", "oklch(0.6 0.1 195)"],
  clay: ["oklch(0.5 0.1 50)", "oklch(0.7 0.1 65)"],
  stone: ["oklch(0.45 0.02 155)", "oklch(0.7 0.015 90)"],
  night: ["oklch(0.22 0.04 220)", "oklch(0.38 0.06 180)"],
};

export function Photo({ caption, h = 200, tone = "forest", style }: PhotoProps) {
  const tones = toneGradients[tone] || toneGradients.forest;
  return (
    <div
      className="img-ph"
      data-caption={caption}
      style={{
        height: h,
        background: `linear-gradient(135deg, ${tones[0]}, ${tones[1]})`,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        style={{ display: "block", opacity: 0.4 }}
      >
        <circle cx="80" cy="60" r="60" fill="oklch(1 0 0 / 0.15)" />
        <circle cx="320" cy="160" r="90" fill="oklch(0 0 0 / 0.18)" />
        <path
          d="M0 140 Q100 100 200 130 T 400 110 L 400 200 L 0 200 Z"
          fill="oklch(0 0 0 / 0.15)"
        />
      </svg>
    </div>
  );
}

interface StripeProps {
  caption?: string;
  h?: number;
  style?: React.CSSProperties;
}

export function Stripe({ caption, h = 200, style }: StripeProps) {
  return (
    <div className="img-stripe" style={{ height: h, ...style }}>
      <span className="img-stripe-label">{caption}</span>
    </div>
  );
}

/* ===== BrandMark ===== */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "var(--forest)",
        display: "grid",
        placeItems: "center",
        borderRadius: 6,
        color: "oklch(0.97 0.015 155)",
        fontFamily: "var(--font-serif)",
        fontSize: size * 0.56,
        fontWeight: 500,
      }}
    >
      C
    </div>
  );
}

/* ===== Toggle ===== */
interface ToggleProps {
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
}

export function Toggle({ defaultOn = false, onChange }: ToggleProps) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <button
      onClick={() => {
        setOn(!on);
        onChange?.(!on);
      }}
      className="toggle"
      style={{ background: on ? "var(--forest)" : "var(--rule)" }}
    >
      <span className="toggle-knob" style={{ left: on ? 21 : 3 }} />
    </button>
  );
}

/* ===== Cite (inline citation marker) ===== */
export function Cite({ n }: { n: number }) {
  return (
    <a
      className="mono"
      style={{
        color: "var(--forest)",
        fontSize: 11,
        padding: "1px 5px",
        background: "var(--forest-tint)",
        borderRadius: 3,
        margin: "0 1px",
        verticalAlign: 1,
        cursor: "pointer",
      }}
    >
      [{n}]
    </a>
  );
}

/* ===== FilterPill ===== */
interface FilterPillProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

export function FilterPill({ children, icon, onRemove }: FilterPillProps) {
  return (
    <span
      className="row items-center gap-1"
      style={{
        padding: "5px 10px",
        borderRadius: 999,
        background: "var(--bg)",
        fontSize: 12,
        color: "var(--ink-soft)",
        border: "1px solid var(--rule)",
      }}
    >
      {icon} {children}
      {onRemove && (
        <span onClick={onRemove} style={{ marginLeft: 4, opacity: 0.6, cursor: "pointer" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6 6 18"/>
          </svg>
        </span>
      )}
    </span>
  );
}

/* ===== ChipBtn (for onboarding toggles) ===== */
interface ChipBtnProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function ChipBtn({ children, active: initialActive = false, onClick }: ChipBtnProps) {
  const [on, setOn] = React.useState(initialActive);
  return (
    <button
      onClick={() => {
        setOn(!on);
        onClick?.();
      }}
      style={{
        padding: "7px 14px",
        borderRadius: 999,
        border: `1px solid ${on ? "var(--forest)" : "var(--rule)"}`,
        background: on ? "var(--forest-tint)" : "var(--paper)",
        color: on ? "var(--forest-deep)" : "var(--ink-soft)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
