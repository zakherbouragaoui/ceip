"use client";

import { useState } from "react";
import { SearchForm } from "@/components/evidence/search-form";
import { ResultCard } from "@/components/evidence/result-card";
import { useEvidenceSearch } from "@/lib/hooks/use-evidence";
import type { EvidenceRequest, EvidenceResult } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function EvidencePage() {
  const search = useEvidenceSearch();
  const [result, setResult] = useState<EvidenceResult | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");

  function handleSearch(req: EvidenceRequest) {
    setLastQuestion(req.question);
    search.mutate(req, {
      onSuccess: (data) => setResult(data),
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Evidence Search
        </h1>
        <p className="text-muted-foreground">
          Ask a conservation question and receive cited, evidence-based
          guidance.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <SearchForm onSubmit={handleSearch} loading={search.isPending} />
        </CardContent>
      </Card>

      {search.isPending && (
        <div className="space-y-4 animate-in fade-in-0 duration-300">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-4">
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {search.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to retrieve evidence. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {result && !search.isPending && (
        <ResultCard result={result} question={lastQuestion} />
      )}
    </div>
  );
}
