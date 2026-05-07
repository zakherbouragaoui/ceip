"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Species } from "@/lib/types";
import { Card, Eyebrow, Badge, Btn, Photo } from "@/components/ui/primitives";
import * as I from "@/components/ui/icons";

const iucnCategories = ["All", "CR", "EN", "VU", "NT", "LC", "DD"];

const toneForIucn: Record<string, "forest" | "moss" | "sand" | "sea" | "clay" | "stone" | "night"> = {
  CR: "clay",
  EN: "clay",
  VU: "sand",
  NT: "sea",
  LC: "forest",
  DD: "stone",
};

function useSpeciesSearch(search: string, category: string) {
  return useQuery({
    queryKey: ["species", search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category && category !== "All") params.set("category", category);
      params.set("limit", "50");
      const { data } = await api.get(`/api/v1/species?${params}`);
      return data as Species[];
    },
    enabled: search.length >= 2 || (category !== "" && category !== "All"),
  });
}

export default function SpeciesPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: species, isLoading } = useSpeciesSearch(debounced, category);
  const sp = species?.[active];

  return (
    <div>
      <div className="row justify-between items-end" style={{ marginBottom: 24 }}>
        <div>
          <Eyebrow>Species explorer</Eyebrow>
          <h1 className="serif" style={{ fontSize: 36, margin: "8px 0 0", letterSpacing: "-0.02em" }}>
            56,198 species &mdash; <span style={{ color: "var(--ink-mute)" }}>indexed from GBIF &amp; IUCN.</span>
          </h1>
        </div>
        <div className="tb-search" style={{ width: 280 }}>
          <I.Search size={14} />
          <input
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--ink)", width: "100%", fontFamily: "inherit" }}
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        <div>
          {/* Filter row */}
          <div className="row gap-2" style={{ marginBottom: 16 }}>
            {iucnCategories.map((f) => (
              <button
                key={f}
                className="btn btn-outline btn-sm"
                onClick={() => setCategory(f)}
                style={{
                  background: category === f ? "var(--forest)" : undefined,
                  color: category === f ? "oklch(0.97 0.015 155)" : undefined,
                  borderColor: category === f ? "var(--forest)" : undefined,
                }}
              >
                {f}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <span className="text-xs text-soft mono">
              {species ? `Showing ${species.length}` : "Type to search"}
            </span>
          </div>

          {/* Species list */}
          {isLoading ? (
            <Card>
              <div className="col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="pulse" style={{ height: 48, background: "var(--rule)", borderRadius: 6 }} />
                ))}
              </div>
            </Card>
          ) : !species?.length ? (
            <Card>
              <div style={{ padding: "40px 0", textAlign: "center" }} className="text-sm text-soft">
                {debounced || category !== "All" ? "No species found." : "Start typing or select an IUCN category."}
              </div>
            </Card>
          ) : (
            <div className="col" style={{ gap: 1, background: "var(--rule)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--rule)" }}>
              {species.map((s, i) => (
                <div
                  key={s.taxon_id}
                  onClick={() => setActive(i)}
                  style={{
                    background: active === i ? "var(--forest-tint)" : "var(--paper)",
                    padding: "14px 18px",
                    cursor: "pointer",
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 24px",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div className="serif" style={{ fontSize: 16, fontStyle: "italic", letterSpacing: "-0.005em" }}>{s.name}</div>
                    <div className="text-xs text-soft">{s.class_name || "Unknown class"}</div>
                  </div>
                  <div>
                    <span className="badge" style={{
                      background: s.category === "VU" || s.category === "EN" || s.category === "CR"
                        ? "oklch(0.95 0.04 50)"
                        : s.category === "NT"
                        ? "oklch(0.95 0.04 85)"
                        : "oklch(0.93 0.04 155)",
                      color: s.category === "VU" || s.category === "EN" || s.category === "CR"
                        ? "oklch(0.48 0.08 50)"
                        : s.category === "NT"
                        ? "oklch(0.42 0.08 85)"
                        : "oklch(0.32 0.06 155)",
                      borderColor: "transparent",
                    }}>
                      {s.category}
                    </span>
                  </div>
                  <I.ChevronRight size={14} style={{ color: "var(--ink-mute)" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail rail */}
        <div className="col gap-4">
          {sp ? (
            <>
              <Card pad={false}>
                <Photo h={200} tone={toneForIucn[sp.category] || "forest"} caption={sp.name} />
                <div style={{ padding: 20 }}>
                  <div className="serif" style={{ fontSize: 22, fontStyle: "italic", letterSpacing: "-0.01em" }}>{sp.name}</div>
                  <div className="text-sm text-soft" style={{ marginBottom: 14 }}>{sp.class_name || "Unknown class"}</div>
                  <div className="row gap-2" style={{ marginBottom: 16 }}>
                    <span className="badge" style={{
                      background: sp.category === "VU" || sp.category === "EN" || sp.category === "CR"
                        ? "oklch(0.95 0.04 50)"
                        : sp.category === "NT"
                        ? "oklch(0.95 0.04 85)"
                        : "oklch(0.93 0.04 155)",
                      color: sp.category === "VU" || sp.category === "EN" || sp.category === "CR"
                        ? "oklch(0.48 0.08 50)"
                        : sp.category === "NT"
                        ? "oklch(0.42 0.08 85)"
                        : "oklch(0.32 0.06 155)",
                      borderColor: "transparent",
                    }}>
                      IUCN {sp.category}
                    </span>
                  </div>
                  <div className="text-sm text-soft" style={{ lineHeight: 1.5 }}>
                    Species indexed from GBIF. IUCN category: {sp.category}.
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
                    <I.Sparkles size={13} /> Generate evidence brief
                  </button>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <Eyebrow>Select a species</Eyebrow>
              <div className="text-sm text-soft" style={{ marginTop: 8 }}>Click on a species in the list to see details here.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
