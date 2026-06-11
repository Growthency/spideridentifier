"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Trash2, Eye, X, AlertTriangle, Printer, FileJson, Images } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SpiderResult {
  commonName?: string;
  scientificName?: string;
  family?: string;
  venomLevel?: "harmless" | "mild" | "caution" | "dangerous" | string;
  confidence?: string;
  summary?: string;
  identification?: string[];
  habitat?: string;
  region?: string;
  lookAlikes?: string[];
  recommendedAction?: string;
  funFact?: string;
}

type Scan = {
  id: string;
  result: SpiderResult;
  created_at: string;
  image_hash: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Scan | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0); // active image in modal gallery

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("analyses")
        .select("id, result, created_at, image_hash, image_url, image_urls")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setScans((data as Scan[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    if (!supabase || !userId) return;
    setDeleting(id);
    await supabase.from("analyses").delete().eq("id", id).eq("user_id", userId);
    setScans((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
  };

  const openModal = (scan: Scan) => {
    setSelected(scan);
    setImgIdx(0);
  };

  const downloadJSON = (scan: Scan) => {
    const blob = new Blob([JSON.stringify({ ...scan.result, scanned_at: scan.created_at }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spider-${scan.result?.commonName?.replace(/\s+/g, "-").toLowerCase() || "scan"}-${new Date(scan.created_at).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printScan = (scan: Scan) => {
    const r = scan.result;
    const date = new Date(scan.created_at).toLocaleString();
    const imgs = getImages(scan);
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    const venomCls = r.venomLevel === "dangerous" ? "high" : r.venomLevel === "caution" ? "medium" : "low";
    win.document.write(`<!DOCTYPE html>
<html><head><title>Spider Scan – ${esc(r.commonName || "Unknown")}</title><meta charset="utf-8"/>
<style>
  body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#111;}
  h1{font-size:2rem;margin-bottom:4px;} .sci{color:#666;font-style:italic;margin-bottom:20px;}
  .badge{display:inline-block;padding:4px 12px;border-radius:99px;font-size:.8rem;font-weight:700;margin-right:8px;}
  .high{background:#fecaca;color:#b91c1c;}.medium{background:#fde68a;color:#92400e;}.low{background:#bbf7d0;color:#166534;}
  .imgs{display:flex;gap:8px;margin:16px 0;}.imgs img{width:160px;height:120px;object-fit:cover;border-radius:8px;}
  .section{margin:20px 0;}.section h2{font-size:1rem;font-weight:700;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:10px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}.item label{font-size:.75rem;color:#666;}.item p{margin:0;font-size:.9rem;}
  ul{margin:0;padding-left:1.2rem;}li{margin-bottom:4px;font-size:.9rem;}
  .warning{background:#fff7ed;border:2px solid #fb923c;border-radius:8px;padding:12px 16px;}
  .action{background:#ecfdf5;border:2px solid #6ee7b7;border-radius:8px;padding:12px 16px;}
  .footer{margin-top:40px;font-size:.75rem;color:#999;border-top:1px solid #eee;padding-top:12px;}
</style></head><body>
<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
  <span style="font-size:2.5rem">🕷️</span>
  <div><h1>${esc(r.commonName || "Unknown")}</h1><p class="sci">${esc(r.scientificName || "")}</p></div>
</div>
<div>
  <span class="badge ${venomCls}">${esc((r.venomLevel || "").toUpperCase())} VENOM</span>
  <span class="badge" style="background:#e0f2fe;color:#0369a1">${esc(r.family || "")}</span>
  <span class="badge" style="background:#f3e8ff;color:#7c3aed">${esc(r.confidence || "")} Confidence</span>
</div>
${imgs.length ? `<div class="imgs">${imgs.map((u) => `<img src="${esc(u)}" alt="scan"/>`).join("")}</div>` : ""}
${r.summary ? `<p style="margin:16px 0;font-size:.95rem">${esc(r.summary)}</p>` : ""}
${r.funFact ? `<p style="margin:16px 0;padding:12px 16px;background:#ecfdf5;border-radius:8px;font-size:.9rem">💡 ${esc(r.funFact)}</p>` : ""}
<div class="section"><h2>Key Identifiers</h2><ul>${(r.identification || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
<div class="section"><h2>Habitat &amp; Range</h2>
<div class="grid">
  <div class="item"><label>Habitat</label><p>${esc(r.habitat || "–")}</p></div>
  <div class="item"><label>Region</label><p>${esc(r.region || "–")}</p></div>
  <div class="item"><label>Family</label><p>${esc(r.family || "–")}</p></div>
</div></div>
${
  r.lookAlikes?.length
    ? `<div class="section"><h2>⚠️ Commonly Confused With</h2><div class="warning"><ul>${r.lookAlikes.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div></div>`
    : ""
}
<div class="section"><h2>Recommended Action</h2><div class="action">${esc(r.recommendedAction || "")}</div></div>
<div class="footer">Identified by SpiderIdentifier · ${esc(date)}<br><strong>⚠️ AI suggestion only — never handle a spider you suspect is venomous.</strong></div>
</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const getImages = (scan: Scan): string[] => {
    if (scan.image_urls && scan.image_urls.length > 0) return scan.image_urls;
    if (scan.image_url) return [scan.image_url];
    return [];
  };

  const riskStyles = (level?: string) =>
    level === "dangerous"
      ? { bg: "#ef444420", text: "#ef4444" }
      : level === "caution"
        ? { bg: "#f59e0b20", text: "#f59e0b" }
        : { bg: "#22c55e20", text: "#16a34a" };

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );

  return (
    <>
      {scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 text-6xl">🕷️</div>
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">No scans yet</h2>
          <p className="mb-6 text-sm text-foreground/60">Upload a spider photo to start identifying</p>
          <Link
            href="/#identify"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-ink-950"
          >
            <Sparkles className="h-4 w-4" /> New Scan
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              {scans.length} scan{scans.length !== 1 ? "s" : ""} found
            </p>
            <Link
              href="/#identify"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-ink-950"
            >
              <Sparkles className="h-4 w-4" /> New Scan
            </Link>
          </div>

          <div className="space-y-3">
            {scans.map((scan) => {
              const r = scan.result;
              const rc = riskStyles(r?.venomLevel);
              const imgs = getImages(scan);
              const date = new Date(scan.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={scan.id} className="overflow-hidden rounded-2xl border border-foreground/8 bg-card">
                  {/* Image strip */}
                  {imgs.length > 0 && (
                    <div className="flex gap-1 p-3 pb-0">
                      {imgs.map((url, i) => (
                        <div key={i} className="relative shrink-0 overflow-hidden rounded-xl" style={{ width: 72, height: 60 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Scan photo ${i + 1}`} className="h-full w-full object-cover" />
                          {i === 0 && imgs.length > 1 && (
                            <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5">
                              <Images className="h-2.5 w-2.5 text-white" />
                              <span className="text-[9px] font-medium text-white">{imgs.length}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Info row */}
                  <div className="flex flex-wrap items-center gap-3 p-4 md:flex-nowrap">
                    {imgs.length === 0 && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: rc.bg }}>
                        🕷️
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{r?.commonName || "Unknown Spider"}</p>
                      <p className="truncate text-xs italic text-foreground/60">{r?.scientificName}</p>
                      <p className="mt-0.5 text-xs text-foreground/45">{date}</p>
                    </div>

                    {/* Risk badges */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full px-2 py-1 text-xs font-bold uppercase" style={{ background: rc.bg, color: rc.text }}>
                        {r?.venomLevel}
                      </span>
                      <span className="hidden rounded-full bg-foreground/5 px-2 py-1 text-xs font-medium text-foreground/60 sm:block">
                        {r?.confidence}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => openModal(scan)}
                        className="rounded-xl bg-gold/10 p-2 text-[rgb(var(--gold-soft))] transition-opacity hover:opacity-70"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => printScan(scan)}
                        className="rounded-xl bg-foreground/5 p-2 text-foreground/60 transition-opacity hover:opacity-70"
                        title="Print / PDF"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadJSON(scan)}
                        className="rounded-xl bg-foreground/5 p-2 text-foreground/60 transition-opacity hover:opacity-70"
                        title="Download JSON"
                      >
                        <FileJson className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(scan.id)}
                        disabled={deleting === scan.id}
                        className="rounded-xl p-2 transition-opacity hover:opacity-70"
                        style={{ background: "#ef444418", color: "#ef4444" }}
                        title="Delete"
                      >
                        {deleting === scan.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Full Result Modal ── */}
      {selected &&
        (() => {
          const imgs = getImages(selected);
          const r = selected.result;
          const rc = riskStyles(r?.venomLevel);
          return (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
              <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-foreground/8 bg-card">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-foreground/8 p-5">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">{r?.commonName}</h2>
                    <p className="text-sm italic text-foreground/60">{r?.scientificName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => printScan(selected)}
                      className="rounded-xl bg-foreground/5 p-2 text-foreground/60 hover:opacity-70"
                      title="Print / PDF"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadJSON(selected)}
                      className="rounded-xl bg-foreground/5 p-2 text-foreground/60 hover:opacity-70"
                      title="Download JSON"
                    >
                      <FileJson className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="rounded-xl bg-foreground/5 p-2 text-foreground/60 hover:opacity-70"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
                  {/* Image gallery */}
                  {imgs.length > 0 && (
                    <div>
                      <div className="mb-2 overflow-hidden rounded-xl" style={{ height: 220 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgs[imgIdx]} alt={`Scan ${imgIdx + 1}`} className="h-full w-full object-cover" />
                      </div>
                      {imgs.length > 1 && (
                        <div className="flex gap-2">
                          {imgs.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => setImgIdx(i)}
                              className={`shrink-0 overflow-hidden rounded-lg transition-all ${i === imgIdx ? "opacity-100 ring-2 ring-gold ring-offset-2" : "opacity-60"}`}
                              style={{ width: 60, height: 48 }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" />
                            </button>
                          ))}
                          <div className="ml-1 flex items-center">
                            <span className="text-xs text-foreground/45">
                              {imgIdx + 1}/{imgs.length} photos
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full px-3 py-1 text-sm font-bold uppercase" style={{ background: rc.bg, color: rc.text }}>
                      {r?.venomLevel} venom
                    </span>
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-sm font-semibold text-[rgb(var(--gold-soft))]">
                      {r?.confidence} Confidence
                    </span>
                    {r?.family && (
                      <span className="rounded-full bg-foreground/5 px-3 py-1 text-sm font-medium text-foreground/60">{r.family}</span>
                    )}
                  </div>

                  {/* Summary */}
                  {r?.summary && <p className="text-sm leading-relaxed text-foreground/80">{r.summary}</p>}

                  {/* Fun fact */}
                  {r?.funFact && <p className="rounded-xl bg-gold/10 p-3 text-sm text-foreground">💡 {r.funFact}</p>}

                  {/* Key Identifiers */}
                  {(r?.identification?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Key Identifiers</h3>
                      <div className="flex flex-wrap gap-2">
                        {r!.identification!.map((f, i) => (
                          <span key={i} className="rounded-full bg-foreground/5 px-3 py-1 text-xs text-foreground">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Habitat & Range */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Habitat &amp; Range</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          ["Habitat", r?.habitat],
                          ["Region", r?.region],
                          ["Family", r?.family],
                        ] as const
                      )
                        .filter(([, v]) => v)
                        .map(([label, val]) => (
                          <div key={label}>
                            <p className="mb-0.5 text-xs font-medium text-foreground/45">{label}</p>
                            <p className="text-sm text-foreground">{val}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Look-alikes */}
                  {(r?.lookAlikes?.length ?? 0) > 0 && (
                    <div className="rounded-xl border-2 border-orange-400/30 bg-orange-400/10 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                        <h3 className="text-sm font-semibold text-orange-400">Commonly Confused With</h3>
                      </div>
                      <ul className="space-y-1">
                        {r!.lookAlikes!.map((f, i) => (
                          <li key={i} className="text-sm text-foreground">
                            • {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended action */}
                  <div
                    className="rounded-xl border-2 p-4"
                    style={{
                      background: r?.venomLevel === "dangerous" ? "#ef444410" : r?.venomLevel === "caution" ? "#f59e0b10" : "#22c55e10",
                      borderColor:
                        r?.venomLevel === "dangerous"
                          ? "rgba(239,68,68,0.3)"
                          : r?.venomLevel === "caution"
                            ? "rgba(251,146,60,0.3)"
                            : "rgba(34,197,94,0.3)",
                    }}
                  >
                    <h3 className="mb-1 text-sm font-semibold text-foreground">Recommended Action</h3>
                    <p className="text-sm text-foreground">{r?.recommendedAction}</p>
                  </div>

                  <p className="text-center text-xs text-foreground/45">
                    Identified {new Date(selected.created_at).toLocaleString()} · SpiderIdentifier
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
