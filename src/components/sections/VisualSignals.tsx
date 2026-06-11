"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnatomySpider, type SpiderPart } from "@/components/identify/AnatomySpider";
import { visualSignals } from "@/content/home";
import { cn } from "@/lib/utils";

const keys: SpiderPart[] = ["body", "legs", "patterns", "eyes", "web"];

export function VisualSignals() {
  const [active, setActive] = useState(0);
  const part = keys[active];

  return (
    <section className="relative py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="What the AI looks at"
          title={<>The five signals that <span className="text-gradient">give a spider away</span></>}
          subtitle="Tap a signal to see what the model reads. Together, these features narrow thousands of species to a confident shortlist."
        />

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          {/* signal list */}
          <div className="order-2 flex flex-col gap-2 lg:order-1">
            {visualSignals.map((sig, i) => {
              const isActive = i === active;
              return (
                <button
                  key={sig.label}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
                    isActive
                      ? "border-gold/40 bg-gold/[0.07]"
                      : "border-foreground/8 bg-card/40 hover:border-foreground/15"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="signal-bar"
                      className="absolute inset-y-0 left-0 w-1 bg-brand-gradient"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <h3
                      className={cn(
                        "font-display text-lg font-bold transition-colors",
                        isActive ? "text-gold" : "text-foreground"
                      )}
                    >
                      {sig.label}
                    </h3>
                    <span className="font-display text-sm font-bold text-foreground/15">0{i + 1}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden text-sm leading-relaxed text-foreground/65"
                      >
                        <span className="block pt-2">{sig.detail}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* illustration */}
          <div className="order-1 lg:order-2">
            <div className="gradient-border relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-4xl bg-card/60 p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.12),transparent_60%)]" />
              <AnatomySpider active={part} />
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--gold-soft))]">
                {visualSignals[active].label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
