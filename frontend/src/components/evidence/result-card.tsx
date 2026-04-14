"use client";

import { useState } from "react";
import type { EvidenceResult } from "@/lib/types";
import { EvidenceStrengthBadge } from "./evidence-strength-badge";
import { InterventionTable } from "./intervention-table";
import { CitationList } from "./citation-list";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Bug,
  AlertTriangle,
} from "lucide-react";
import { useFeedback } from "@/lib/hooks/use-evidence";
import { toast } from "sonner";

interface ResultCardProps {
  result: EvidenceResult;
  question: string;
}

export function ResultCard({ result, question }: ResultCardProps) {
  const [gapsOpen, setGapsOpen] = useState(false);
  const feedback = useFeedback();
  const [voted, setVoted] = useState<"positive" | "negative" | null>(null);

  function handleFeedback(rating: "positive" | "negative") {
    setVoted(rating);
    feedback.mutate(
      { question, rating },
      {
        onSuccess: () => toast.success("Thanks for your feedback!"),
      }
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Answer */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Evidence Summary</CardTitle>
            <EvidenceStrengthBadge strength={result.confidence} />
          </div>
          <div className="flex gap-1">
            <Button
              variant={voted === "positive" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleFeedback("positive")}
              disabled={voted !== null}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant={voted === "negative" ? "destructive" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleFeedback("negative")}
              disabled={voted !== null}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {result.answer}
          </p>

          {/* Limits */}
          {(result.geo_limits || result.taxa_limits) && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {result.geo_limits && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {result.geo_limits}
                  </span>
                )}
                {result.taxa_limits && (
                  <span className="flex items-center gap-1">
                    <Bug className="h-3 w-3" /> {result.taxa_limits}
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Interventions */}
      {result.interventions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Interventions ({result.interventions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InterventionTable interventions={result.interventions} />
          </CardContent>
        </Card>
      )}

      {/* Evidence gaps */}
      {result.evidence_gaps.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setGapsOpen(!gapsOpen)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Evidence Gaps ({result.evidence_gaps.length})
              </CardTitle>
              {gapsOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {gapsOpen && (
            <CardContent>
              <ul className="space-y-2">
                {result.evidence_gaps.map((gap, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                    {gap}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* Citations */}
      {result.citations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              References ({result.citations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CitationList citations={result.citations} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
