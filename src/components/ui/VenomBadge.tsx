import { cn } from "@/lib/utils";
import type { VenomLevel } from "@/lib/types";
import { Shield, ShieldAlert, ShieldX, ShieldCheck } from "lucide-react";

const map: Record<
  VenomLevel,
  { label: string; className: string; Icon: typeof Shield }
> = {
  harmless: {
    label: "Harmless",
    className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 ring-emerald-400/25",
    Icon: ShieldCheck,
  },
  mild: {
    label: "Mild",
    className: "bg-amber-500/12 text-amber-700 dark:text-amber-300 ring-amber-400/25",
    Icon: Shield,
  },
  caution: {
    label: "Caution",
    className: "bg-orange-500/12 text-orange-600 dark:text-orange-300 ring-orange-400/25",
    Icon: ShieldAlert,
  },
  dangerous: {
    label: "Dangerous",
    className: "bg-red-500/15 text-red-600 dark:text-red-300 ring-red-400/30",
    Icon: ShieldX,
  },
};

export function VenomBadge({ level, className }: { level: VenomLevel; className?: string }) {
  const { label, className: tone, Icon } = map[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tone,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
