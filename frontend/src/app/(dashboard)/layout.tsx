"use client";

import { useRequireAuth } from "@/lib/hooks/use-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div className="col gap-3" style={{ width: 256 }}>
          <div className="pulse" style={{ height: 32, background: "var(--rule)", borderRadius: 6 }} />
          <div className="pulse" style={{ height: 16, width: "75%", background: "var(--rule)", borderRadius: 4 }} />
          <div className="pulse" style={{ height: 16, width: "50%", background: "var(--rule)", borderRadius: 4 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <AppSidebar />
      <main className="app-main">
        <Topbar />
        <div className="shell-pad fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
