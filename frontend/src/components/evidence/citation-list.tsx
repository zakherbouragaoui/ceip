import type { Citation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const sourceColors: Record<string, string> = {
  "Conservation Evidence": "bg-green-100 text-green-800",
  CORE: "bg-blue-100 text-blue-800",
  OpenAlex: "bg-purple-100 text-purple-800",
};

export function CitationList({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;

  return (
    <div className="space-y-2">
      {citations.map((c) => {
        const doiUrl = c.paper_id.startsWith("10.")
          ? `https://doi.org/${c.paper_id}`
          : null;
        return (
          <div
            key={c.index}
            className="flex items-start gap-3 rounded-lg border p-3 text-sm"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {c.index}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-snug">{c.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {c.year && (
                  <span className="text-xs text-muted-foreground">
                    {c.year}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={`text-xs ${sourceColors[c.source] ?? ""}`}
                >
                  {c.source}
                </Badge>
              </div>
            </div>
            {doiUrl && (
              <a
                href={doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
