"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import {
  UploadCloud,
  ImageIcon,
  Loader2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Coins,
  LogIn,
} from "lucide-react";
import { speciesLibrary } from "@/content/species";
import { VenomBadge } from "@/components/ui/VenomBadge";
import type { Species, VenomLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

type Stage = "idle" | "preview" | "analyzing" | "result" | "demo" | "limit" | "error";

interface AiResult {
  commonName: string;
  scientificName: string;
  family?: string;
  venomLevel: VenomLevel;
  confidence: string;
  summary?: string;
  identification?: string[];
  habitat?: string;
  region?: string;
  lookAlikes?: string[];
  recommendedAction?: string;
  funFact?: string;
}

interface Match {
  species: Species;
  confidence: number;
}

function buildMatches(): Match[] {
  const pool = [...speciesLibrary];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const top = 86 + Math.random() * 11;
  return [
    { species: pool[0], confidence: top },
    { species: pool[1], confidence: top - (9 + Math.random() * 8) },
    { species: pool[2], confidence: top - (17 + Math.random() * 8) },
  ];
}

function findSpeciesSlug(scientificName?: string): string | null {
  if (!scientificName) return null;
  const n = scientificName.toLowerCase();
  const hit = speciesLibrary.find(
    (s) => n.includes(s.scientific_name.toLowerCase().split(" ")[0]) || s.scientific_name.toLowerCase().includes(n)
  );
  return hit?.slug ?? null;
}

export function IdentifyTool({ className }: { className?: string }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [meta, setMeta] = useState<{ creditsLeft: number | null; guest: boolean }>({ creditsLeft: null, guest: false });
  const [limit, setLimit] = useState<"guest_limit" | "no_credits" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f?: File | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(f));
    setFile(f);
    setStage("preview");
  }, []);

  const analyze = useCallback(async () => {
    if (!file) return;
    setStage("analyzing");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/identify", { method: "POST", body: fd });

      if (res.status === 503) {
        // AI not configured — graceful demo
        await new Promise((r) => setTimeout(r, 1800));
        setMatches(buildMatches());
        setStage("demo");
        return;
      }
      const json = await res.json();
      if (res.status === 402) {
        setLimit(json.error === "guest_limit" ? "guest_limit" : "no_credits");
        setStage("limit");
        return;
      }
      if (!res.ok) throw new Error(json.message || "Identification failed. Please try another photo.");
      setResult(json.result);
      setMeta({ creditsLeft: json.creditsLeft ?? null, guest: !!json.guest });
      setStage("result");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
      setStage("error");
    }
  }, [file]);

  const reset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setResult(null);
    setMatches([]);
    setLimit(null);
    setStage("idle");
    if (inputRef.current) inputRef.current.value = "";
  }, [preview]);

  const slug = result ? findSpeciesSlug(result.scientificName) : null;

  return (
    <div className={cn("gradient-border overflow-hidden rounded-4xl p-1.5", className)}>
      <div className="rounded-[1.85rem] bg-card/80 p-4 backdrop-blur-xl sm:p-6">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

        <AnimatePresence mode="wait">
          {/* IDLE */}
          {stage === "idle" && (
            <m.div
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
                <span className="rounded-full bg-foreground/5 px-2.5 py-1">📷 Clear &amp; well-lit</span>
                <span className="rounded-full bg-foreground/5 px-2.5 py-1">🕷️ Side angle</span>
                <span className="rounded-full bg-foreground/5 px-2.5 py-1">🔍 Fills the frame</span>
              </div>
            </m.div>
          )}

          {/* PREVIEW + ANALYZING */}
          {(stage === "preview" || stage === "analyzing") && preview && (
            <m.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-foreground/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Spider to identify" className="h-64 w-full object-cover sm:h-80" />
                {stage === "analyzing" && (
                  <>
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
                    <m.div
                      initial={{ top: "0%" }}
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_20px_4px_rgba(16,185,129,0.6)]"
                    />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="flex items-center gap-2.5 rounded-full glass-card px-4 py-2 text-sm font-medium">
                        <Loader2 className="h-4 w-4 animate-spin text-gold" /> Analysing features…
                      </div>
                    </div>
                  </>
                )}
                {stage === "preview" && (
                  <button onClick={reset} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass text-foreground hover:text-red-500" aria-label="Remove image">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {stage === "preview" && (
                <button onClick={analyze} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-semibold text-ink-950 transition-transform hover:-translate-y-0.5">
                  <Sparkles className="h-4.5 w-4.5" /> Identify this spider
                </button>
              )}
              {stage === "analyzing" && (
                <div className="mt-4 space-y-2">
                  {["Isolating the spider", "Measuring legs & body", "Matching against 50,000+ species"].map((step, i) => (
                    <m.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }} className="flex items-center gap-2 text-sm text-foreground/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {step}
                    </m.div>
                  ))}
                </div>
              )}
            </m.div>
          )}

          {/* REAL RESULT */}
          {stage === "result" && result && (
            <m.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-foreground/45">Identified · {result.confidence} confidence</p>
                    <p className="font-display text-lg font-bold leading-tight">{result.commonName}</p>
                  </div>
                </div>
                <VenomBadge level={result.venomLevel} />
              </div>
              <p className="mt-1 text-sm italic text-foreground/55">
                {result.scientificName}
                {result.family ? ` · ${result.family}` : ""}
              </p>

              {result.summary && <p className="mt-3 rounded-xl bg-foreground/[0.03] p-3 text-sm leading-relaxed text-foreground/70">{result.summary}</p>}

              {result.identification?.length ? (
                <ul className="mt-3 space-y-1.5">
                  {result.identification.slice(0, 5).map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {p}
                    </li>
                  ))}
                </ul>
              ) : null}

              {result.recommendedAction && (
                <p className={cn("mt-3 flex items-start gap-2 rounded-xl p-3 text-sm", result.venomLevel === "dangerous" ? "bg-red-500/8 text-foreground/80" : "bg-foreground/[0.03] text-foreground/70")}>
                  <AlertCircle className={cn("mt-0.5 h-4 w-4 shrink-0", result.venomLevel === "dangerous" ? "text-red-500" : "text-gold")} />
                  {result.recommendedAction}
                </p>
              )}

              {result.funFact && (
                <p className="mt-3 flex items-start gap-2 text-xs text-foreground/55">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> {result.funFact}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {slug ? (
                  <Link href={`/species/${slug}`} className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-gradient text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5">
                    Full species profile <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link href="/species" className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-gradient text-sm font-semibold text-ink-950">
                    Browse species <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <button onClick={reset} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full glass-card px-5 text-sm font-semibold">
                  <RefreshCw className="h-4 w-4" /> Identify another
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] text-foreground/40">
                {meta.guest
                  ? "Free scan · sign up for unlimited history"
                  : meta.creditsLeft !== null
                    ? `${meta.creditsLeft} credits left`
                    : ""}
              </p>
            </m.div>
          )}

          {/* DEMO RESULT (AI not configured) */}
          {stage === "demo" && matches.length > 0 && (
            <m.div key="demo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
              <div className="mt-4 space-y-3">
                {matches.map((match, i) => (
                  <div key={match.species.slug}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={i === 0 ? "font-semibold text-foreground" : "text-foreground/60"}>{match.species.common_name}</span>
                      <span className="tabular-nums text-foreground/60">{Math.round(match.confidence)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/8">
                      <m.div initial={{ width: 0 }} animate={{ width: `${match.confidence}%` }} transition={{ duration: 0.9, delay: 0.15 + i * 0.12 }} className={cn("h-full rounded-full", i === 0 ? "bg-brand-gradient" : "bg-foreground/25")} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link href={`/species/${matches[0].species.slug}`} className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-gradient text-sm font-semibold text-ink-950">
                  Full species profile <ArrowRight className="h-4 w-4" />
                </Link>
                <button onClick={reset} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full glass-card px-5 text-sm font-semibold">
                  <RefreshCw className="h-4 w-4" /> Identify another
                </button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-foreground/40">
                <ImageIcon className="h-3 w-3" /> Demo result — add your Anthropic API key for live AI predictions.
              </p>
            </m.div>
          )}

          {/* LIMIT (guest used up / out of credits) */}
          {stage === "limit" && (
            <m.div key="limit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 text-center">
              {limit === "guest_limit" ? (
                <>
                  <LogIn className="mx-auto h-10 w-10 text-gold" />
                  <h3 className="mt-3 font-display text-lg font-bold">You&apos;ve used your free scans</h3>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-foreground/60">Create a free account for 30 credits, scan history and more.</p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-full bg-brand-gradient px-6 text-sm font-semibold text-ink-950">Sign up free</Link>
                    <button onClick={reset} className="inline-flex h-11 items-center justify-center rounded-full glass-card px-5 text-sm font-semibold">Back</button>
                  </div>
                </>
              ) : (
                <>
                  <Coins className="mx-auto h-10 w-10 text-gold" />
                  <h3 className="mt-3 font-display text-lg font-bold">You&apos;re out of credits</h3>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-foreground/60">Upgrade your plan for more identifications.</p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Link href="/pricing" className="inline-flex h-11 items-center justify-center rounded-full bg-brand-gradient px-6 text-sm font-semibold text-ink-950">View plans</Link>
                    <button onClick={reset} className="inline-flex h-11 items-center justify-center rounded-full glass-card px-5 text-sm font-semibold">Back</button>
                  </div>
                </>
              )}
            </m.div>
          )}

          {/* ERROR */}
          {stage === "error" && (
            <m.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
              <h3 className="mt-3 font-display text-lg font-bold">Couldn&apos;t identify that</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-foreground/60">{errorMsg}</p>
              <button onClick={reset} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 text-sm font-semibold text-ink-950">
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
