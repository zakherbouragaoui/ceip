import type { Intervention } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categoryColors: Record<string, string> = {
  Beneficial: "bg-green-100 text-green-800",
  "Likely beneficial": "bg-emerald-100 text-emerald-800",
  "Trade-off": "bg-yellow-100 text-yellow-800",
  "Likely ineffective": "bg-orange-100 text-orange-800",
  Ineffective: "bg-red-100 text-red-800",
  Unknown: "bg-gray-100 text-gray-800",
};

const directionIcons: Record<string, string> = {
  positive: "text-green-600",
  negative: "text-red-600",
  mixed: "text-yellow-600",
  unclear: "text-gray-500",
};

export function InterventionTable({
  interventions,
}: {
  interventions: Intervention[];
}) {
  if (!interventions.length) return null;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Intervention</TableHead>
            <TableHead className="w-36">Category</TableHead>
            <TableHead className="w-32">Effectiveness</TableHead>
            <TableHead className="w-20 text-center">Studies</TableHead>
            <TableHead className="w-24 text-center">Direction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interventions.map((iv, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{iv.name}</TableCell>
              <TableCell>
                {iv.ce_category && (
                  <Badge
                    variant="outline"
                    className={
                      categoryColors[iv.ce_category] ?? categoryColors.Unknown
                    }
                  >
                    {iv.ce_category}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {iv.effectiveness_pct != null ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${iv.effectiveness_pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {iv.effectiveness_pct.toFixed(0)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell className="text-center">{iv.n_studies}</TableCell>
              <TableCell className="text-center">
                <span
                  className={`text-sm font-medium capitalize ${
                    directionIcons[iv.outcome_direction] ?? ""
                  }`}
                >
                  {iv.outcome_direction}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
