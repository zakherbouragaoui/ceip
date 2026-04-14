"use client";

import { use } from "react";
import { useQueryResult } from "@/lib/hooks/use-evidence";
import { ResultCard } from "@/components/evidence/result-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EvidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: result, isLoading, isError } = useQueryResult(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/evidence">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Evidence Result
        </h1>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Result not found or has expired.
            </p>
          </CardContent>
        </Card>
      )}

      {result && <ResultCard result={result} question="" />}
    </div>
  );
}
