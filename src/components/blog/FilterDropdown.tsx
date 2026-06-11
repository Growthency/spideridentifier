"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterDropdown({
  icon: Icon,
  value,
  options,
  onChange,
}: {
  icon: LucideIcon;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-full border border-foreground/12 bg-card/60 px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-gold/40 sm:w-auto"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gold" />
          {value}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-foreground/40 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-[12rem] overflow-hidden rounded-2xl border border-foreground/10 bg-card p-1.5 shadow-card">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                opt === value ? "bg-gold/10 text-gold" : "text-foreground/75 hover:bg-foreground/5"
              )}
            >
              {opt}
              {opt === value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
