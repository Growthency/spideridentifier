"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SpeciesCard } from "@/components/ui/SpeciesCard";
import type { Species, VenomLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: { label: string; value: VenomLevel | "all" }[] = [
  { label: "All spiders", value: "all" },
  { label: "Harmless", value: "harmless" },
  { label: "Mild", value: "mild" },
  { label: "Caution", value: "caution" },
  { label: "Dangerous", value: "dangerous" },
];

export function SpeciesExplorer({ species }: { species: Species[] }) {
  const [filter, setFilter] = useState<VenomLevel | "all">("all");
  const list = filter === "all" ? species : species.filter((s) => s.venom_level === filter);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        {filters.map((f) => {
          const active = filter === f.value;
          const count =
            f.value === "all" ? species.length : species.filter((s) => s.venom_level === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active ? "text-ink-950" : "text-foreground/60 hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="species-filter"
                  className="absolute inset-0 -z-10 rounded-full bg-brand-gradient"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              )}
              {f.label}
              <span className={cn("ml-1.5 text-xs", active ? "text-ink-950/70" : "text-foreground/40")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((s) => (
          <motion.div key={s.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SpeciesCard species={s} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
