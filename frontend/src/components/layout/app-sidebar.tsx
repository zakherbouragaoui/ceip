"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useUnreadCount } from "@/lib/hooks/use-alerts";
import * as I from "@/components/ui/icons";

const navItems = [
  { href: "/dashboard", id: "dashboard", label: "Dashboard", icon: I.Home },
  { href: "/evidence", id: "evidence", label: "Evidence", icon: I.Book },
  { href: "/species", id: "species", label: "Species", icon: I.Leaf },
  { href: "/projects", id: "projects", label: "Projects", icon: I.Folder },
  { href: "/map", id: "map", label: "Map", icon: I.Map },
  { href: "/tnfd", id: "tnfd", label: "Reports", icon: I.FileText },
  { href: "/digest", id: "digest", label: "Digest", icon: I.Mail },
  { href: "/alerts", id: "alerts", label: "Alerts", icon: I.Bell },
];

const accountItems = [
  { href: "/profile", id: "profile", label: "Profile", icon: I.User },
  { href: "/connections", id: "connections", label: "Connections", icon: I.Link },
  { href: "/billing", id: "billing", label: "Billing", icon: I.CreditCard },
  { href: "/settings", id: "settings", label: "Settings", icon: I.Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: unreadCount } = useUnreadCount();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-brand-mark">C</div>
        <div>
          <div className="sb-brand-name">CEIP</div>
          <div className="sb-brand-sub">{user?.name ? "Workspace" : "Conservation Evidence"}</div>
        </div>
      </div>

      {/* Workspace nav */}
      <div className="sb-section">Workspace</div>
      {navItems.map((n) => (
        <Link
          key={n.id}
          href={n.href}
          className={`sb-link ${isActive(n.href) ? "active" : ""}`}
        >
          <n.icon size={16} />
          <span>{n.label}</span>
          {n.id === "alerts" && unreadCount ? (
            <span
              style={{
                marginLeft: "auto",
                background: "var(--clay)",
                color: "oklch(0.97 0.01 50)",
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 999,
                fontFamily: "var(--font-mono)",
              }}
            >
              {unreadCount}
            </span>
          ) : null}
        </Link>
      ))}

      {/* Account nav */}
      <div className="sb-section">Account</div>
      {accountItems.map((n) => (
        <Link
          key={n.id}
          href={n.href}
          className={`sb-link ${isActive(n.href) ? "active" : ""}`}
        >
          <n.icon size={16} />
          <span>{n.label}</span>
        </Link>
      ))}

      {/* Footer */}
      <div className="sb-foot">
        <div className="sb-user" onClick={logout} title="Sign out">
          <div className="sb-user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-user-name">{user?.name ?? "User"}</div>
            <div className="sb-user-meta">{user?.email ?? ""}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
