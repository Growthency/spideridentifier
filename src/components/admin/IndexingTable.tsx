"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Search, Loader2, HelpCircle } from "lucide-react";

interface Row {
  url: string;
  path: string;
  indexedByTraffic: boolean;
}
interface Inspection {
  verdict: string;
  coverageState: string;
  lastCrawlTime?: string;
}

/** URL list with on-demand Search Console inspection per row. */
export function IndexingTable({ rows, gscConfigured }: { rows: Row[]; gscConfigured: boolean }) {
  const [results, setResults] = useState<Record<string, Inspection | "loading" | "error">>({});

  async function inspect(url: string) {
    setResults((r) => ({ ...r, [url]: "loading" }));
    try {
      const res = await fetch("/api/admin/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResults((r) => ({ ...r, [url]: json as Inspection }));
    } catch {
      setResults((r) => ({ ...r, [url]: "error" }));
    }
  }

  const status = (row: Row) => {
    const r = results[row.url];
    if (r === "loading") return <Loader2 className="h-4 w-4 animate-spin text-foreground/40" />;
    if (r === "error") return <span className="text-xs font-medium text-red-500">Inspection failed</span>;
    if (r && typeof r === "object") {
      const pass = r.verdict === "PASS";
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${pass ? "text-emerald-500" : "text-amber-500"}`}>
          {pass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <HelpCircle className="h-3.5 w-3.5" />}
          {r.coverageState}
        </span>
      );
    }
    if (row.indexedByTraffic) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
          <CheckCircle2 className="h-3.5 w-3.5" /> Indexed (has search traffic)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/40">
        <XCircle className="h-3.5 w-3.5" /> Unknown
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
      <table className="w-full text-sm">
        <thead className="bg-foreground/[0.02] text-left text-xs uppercase tracking-wide text-foreground/45">
          <tr>
            <th className="p-4 font-medium">URL</th>
            <th className="p-4 font-medium">Index status</th>
            <th className="p-4 text-right font-medium">Check</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.url} className="border-t border-foreground/8">
              <td className="max-w-xs truncate p-4 font-mono text-xs text-foreground">{row.path}</td>
              <td className="p-4">{status(row)}</td>
              <td className="p-4 text-right">
                <button
                  onClick={() => inspect(row.url)}
                  disabled={!gscConfigured || results[row.url] === "loading"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/5 disabled:opacity-40"
                  title={gscConfigured ? "Inspect with Search Console" : "Connect Search Console first"}
                >
                  <Search className="h-3 w-3" /> Inspect
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
