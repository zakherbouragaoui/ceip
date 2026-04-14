import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import type { EvidenceStrength } from "@/lib/types";

const config: Record<
  EvidenceStrength,
  { label: string; className: string; icon: typeof ShieldCheck }
> = {
  strong: {
    label: "Strong Evidence",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: ShieldCheck,
  },
  moderate: {
    label: "Moderate Evidence",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Shield,
  },
  weak: {
    label: "Weak Evidence",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: ShieldAlert,
  },
  none: {
    label: "No Evidence",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: ShieldX,
  },
};

export function EvidenceStrengthBadge({
  strength,
}: {
  strength: EvidenceStrength;
}) {
  const c = config[strength];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`gap-1.5 px-3 py-1 ${c.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {c.label}
    </Badge>
  );
}
