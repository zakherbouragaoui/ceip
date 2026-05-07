"use client";

import { useRouter } from "next/navigation";
import * as I from "@/components/ui/icons";
import { Btn } from "@/components/ui/primitives";
import { useUnreadCount } from "@/lib/hooks/use-alerts";

export function Topbar() {
  const router = useRouter();
  const { data: unreadCount } = useUnreadCount();

  return (
    <div className="topbar">
      <div className="tb-search" onClick={() => router.push("/evidence")}>
        <I.Search size={14} />
        <span>Search evidence, species, interventions...</span>
        <span className="tb-search-kbd">&#8984;K</span>
      </div>
      <div className="tb-actions">
        <button className="tb-icon-btn">
          <I.Sparkles size={16} />
        </button>
        <button className="tb-icon-btn" onClick={() => router.push("/alerts")}>
          <I.Bell size={16} />
          {unreadCount ? <span className="dot" /> : null}
        </button>
        <div style={{ width: 1, height: 22, background: "var(--rule)" }} />
        <Btn variant="primary" size="sm" onClick={() => router.push("/evidence")}>
          <I.Sparkles size={13} /> New synthesis
        </Btn>
      </div>
    </div>
  );
}
