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
    className: "bg-gold/12 text-[rgb(var(--gold-soft))] ring-gold/30",
    Icon: Shield,
  },
  caution: {
    label: "Caution",
    className: "bg-orange-500/12 text-orange-600 dark:text-orange-300 ring-orange-400/25",
    Icon: ShieldAlert,
  },
  dangerous: {
    label: "Dangerous",
    className: "bg-crimson/15 text-[rgb(var(--crimson-soft))] ring-crimson/35",
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
