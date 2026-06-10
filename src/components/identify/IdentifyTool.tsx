"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, ImageIcon, Loader2, RefreshCw, ArrowRight, Sparkles, X } from "lucide-react";
import { speciesLibrary } from "@/content/species";
import { VenomBadge } from "@/components/ui/VenomBadge";
import type { Species } from "@/lib/types";
import { cn } from "@/lib/utils";

type Stage = "idle" | "preview" | "analyzing" | "result";

interface Match {
  species: Species;
  confidence: number;
}

/** Pick a believable top match + two alternates for the demo experience. */
function buildMatches(): Match[] {
  const pool = [...speciesLibrary];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const top = 86 + Math.random() * 11; // 86–97%
  const second = top - (9 + Math.random() * 8);
  const third = second - (8 + Math.random() * 8);
  return [
    { species: pool[0], confidence: top },
    { species: pool[1], confidence: second },
    { species: pool[2], confidence: third },
  ];
}

export function IdentifyTool({ className }: { className?: string }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleFile = useCallback((file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStage("preview");
  }, []);

  const analyze = useCallback(() => {
    setStage("analyzing");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMatches(buildMatches());
      setStage("result");
    }, 2600);
  }, []);

  const reset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setMatches([]);
    setStage("idle");
    if (inputRef.current) inputRef.current.value = "";
  }, [preview]);

  return (
    <div className={cn("gradient-border overflow-hidden rounded-4xl p-1.5", className)}>
      <div className="rounded-[1.85rem] bg-card/80 p-4 backdrop-blur-xl sm:p-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <AnimatePresence mode="wait">
          {/* IDLE — dropzone */}
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed px-6 py-12 text-center transition-colors sm:py-16",
                dragging ? "border-gold bg-gold/10" : "border-foreground/12 hover:border-gold/50 hover:bg-foreground/[0.03]"
              )}
            >
              <div className="relative mb-5">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-gold/30" />
                <span className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-gradient text-ink-950">
                  <UploadCloud className="h-7 w-7" />
                </span>
              </div>
              <p className="font-display text-lg font-semibold">Drop a spider photo to identify</p>
              <p className="mt-1.5 text-sm text-foreground/55">
                or <span className="text-gold">browse your files</span> — JPG, PNG or WebP, up to 10MB
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-foreground/45">
                <span className="rounded-full bg-foreground/5 px-2.5 py-1">📷 Clear & well-lit</span>
                <span className="rounded-full bg-foreground/5 px-2.5 py-1">🕷️ Side angle</span>
                <span className="rounded-full bg-foreground/5 px-2.5 py-1">🔍 Fills the frame</span>
              </div>
            </motion.div>
          )}

          {/* PREVIEW + ANALYZING */}
          {(stage === "preview" || stage === "analyzing") && preview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative overflow-hidden rounded-[1.5rem] border border-foreground/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Spider to identify" className="h-64 w-full object-cover sm:h-80" />
                {stage === "analyzing" && (
                  <>
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
                    <motion.div
                      initial={{ top: "0%" }}
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_20px_4px_rgba(245,165,36,0.6)]"
                    />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="flex items-center gap-2.5 rounded-full glass-card px-4 py-2 text-sm font-medium">
                        <Loader2 className="h-4 w-4 animate-spin text-gold" />
                        Analysing features…
                      </div>
                    </div>
                  </>
                )}
                {stage === "preview" && (
                  <button
                    onClick={reset}
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass text-foreground hover:text-crimson"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {stage === "preview" && (
                <button
                  onClick={analyze}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  Identify this spider
                </button>
              )}
              {stage === "analyzing" && (
                <div className="mt-4 space-y-2">
                  {["Isolating the spider", "Measuring legs & body", "Matching against 50,000+ species"].map(
                    (step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.6 }}
                        className="flex items-center gap-2 text-sm text-foreground/60"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {step}
                      </motion.div>
                    )
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* RESULT */}
          {stage === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-foreground/45">Top match</p>
                    <p className="font-display text-lg font-bold leading-tight">{matches[0].species.common_name}</p>
                  </div>
                </div>
                <VenomBadge level={matches[0].species.venom_level} />
              </div>

              <p className="mt-1 text-sm italic text-foreground/55">{matches[0].species.scientific_name}</p>

              {/* confidence bars */}
              <div className="mt-4 space-y-3">
                {matches.map((m, i) => (
                  <div key={m.species.slug}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={i === 0 ? "font-semibold text-foreground" : "text-foreground/60"}>
                        {m.species.common_name}
                      </span>
                      <span className="tabular-nums text-foreground/60">{Math.round(m.confidence)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/8">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.confidence}%` }}
                        transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: "easeOut" }}
                        className={cn("h-full rounded-full", i === 0 ? "bg-brand-gradient" : "bg-foreground/25")}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 rounded-xl bg-foreground/[0.03] p-3 text-xs leading-relaxed text-foreground/60">
                {matches[0].species.summary}
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/species/${matches[0].species.slug}`}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-gradient text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
                >
                  Full species profile <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={reset}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full glass-card px-5 text-sm font-semibold"
                >
                  <RefreshCw className="h-4 w-4" /> Identify another
                </button>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-foreground/40">
                <ImageIcon className="h-3 w-3" />
                Demo result for design preview. Connect a model for live predictions.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
