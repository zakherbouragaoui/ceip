"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Species } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

const iucnCategories = [
  { value: "", label: "All" },
  { value: "CR", label: "CR" },
  { value: "EN", label: "EN" },
  { value: "VU", label: "VU" },
  { value: "NT", label: "NT" },
  { value: "LC", label: "LC" },
  { value: "DD", label: "DD" },
];

const iucnColors: Record<string, string> = {
  CR: "bg-red-600 text-white",
  EN: "bg-orange-500 text-white",
  VU: "bg-yellow-500 text-black",
  NT: "bg-lime-500 text-black",
  LC: "bg-green-600 text-white",
  DD: "bg-gray-400 text-white",
};

function useSpeciesSearch(search: string, category: string) {
  return useQuery({
    queryKey: ["species", search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      params.set("limit", "50");
      const { data } = await api.get(`/api/v1/species?${params}`);
      return data as Species[];
    },
    enabled: search.length >= 2 || category !== "",
  });
}

export default function SpeciesPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: species, isLoading } = useSpeciesSearch(debounced, category);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Species Explorer
        </h1>
        <p className="text-muted-foreground">
          Browse 56,000+ species tracked in the CEIP database.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search species (e.g., Panthera tigris)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {iucnCategories.map((c) => (
            <Badge
              key={c.value}
              variant={category === c.value ? "default" : "outline"}
              className={`cursor-pointer ${
                category === c.value && c.value
                  ? iucnColors[c.value] ?? ""
                  : ""
              }`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </Badge>
          ))}
        </div>
      </div>

      {!debounced && !category ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Start typing to search species, or select an IUCN category.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 pt-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !species?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No species found matching your criteria.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {species.map((sp) => (
            <Card key={sp.taxon_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium italic">
                    {sp.name}
                  </CardTitle>
                  <Badge
                    className={`text-xs ${iucnColors[sp.category] ?? "bg-gray-200"}`}
                  >
                    {sp.category}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {sp.class_name || "Unknown class"}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
