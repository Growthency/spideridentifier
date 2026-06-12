import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

interface Check {
  label: string;
  pass: boolean;
  warn?: boolean;
  detail: string;
}
interface PageAudit {
  path: string;
  ok: boolean;
  checks: Check[];
  score: number;
}

const PAGES = ["/", "/blog", "/blog/black-widow-spider-identification", "/species", "/species/black-widow", "/pricing", "/about"];

const pick = (html: string, re: RegExp) => re.exec(html)?.[1]?.trim() ?? "";

async function auditPage(path: string): Promise<PageAudit> {
  try {
    const res = await fetch(`${siteConfig.url}${path === "/" ? "" : path}`, {
      cache: "no-store",
      headers: { "User-Agent": "SpiderIdentifier-SEO-Health" },
    });
    const html = await res.text();

    const title = pick(html, /<title[^>]*>([^<]*)<\/title>/i);
    const desc = pick(html, /<meta name="description" content="([^"]*)"/i);
    const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/i);
    const ogImage = pick(html, /<meta property="og:image" content="([^"]*)"/i);
    const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
    const jsonLd = html.includes("application/ld+json");

    const checks: Check[] = [
      { label: "HTTP 200", pass: res.ok, detail: `Status ${res.status}` },
      {
        label: "Title (10–60 chars)",
        pass: title.length > 0,
        warn: title.length > 60 || (title.length > 0 && title.length < 10),
        detail: title ? `${title.length} chars` : "Missing",
      },
      {
        label: "Meta description (50–160)",
        pass: desc.length > 0,
        warn: desc.length > 160 || (desc.length > 0 && desc.length < 50),
        detail: desc ? `${desc.length} chars` : "Missing",
      },
      { label: "Canonical tag", pass: Boolean(canonical), detail: canonical || "Missing" },
      { label: "Open Graph image", pass: Boolean(ogImage), detail: ogImage ? "Present" : "Missing" },
      { label: "Exactly one H1", pass: h1Count === 1, detail: `${h1Count} found` },
      { label: "Structured data (JSON-LD)", pass: jsonLd, detail: jsonLd ? "Present" : "Missing" },
    ];
    const passed = checks.filter((c) => c.pass && !c.warn).length;
    return { path, ok: res.ok, checks, score: Math.round((passed / checks.length) * 100) };
  } catch {
    return {
      path,
      ok: false,
      checks: [{ label: "Fetch", pass: false, detail: "Could not reach the page (is the site deployed?)" }],
      score: 0,
    };
  }
}

async function checkEndpoint(path: string): Promise<Check> {
  try {
    const res = await fetch(`${siteConfig.url}${path}`, { cache: "no-store" });
    return { label: path, pass: res.ok, detail: `Status ${res.status}` };
  } catch {
    return { label: path, pass: false, detail: "Unreachable" };
  }
}

export default async function SeoHealthAdmin() {
  const [audits, infra] = await Promise.all([
    Promise.all(PAGES.map(auditPage)),
    Promise.all(["/robots.txt", "/sitemap.xml", "/feed.xml", "/manifest.webmanifest"].map(checkEndpoint)),
  ]);

  const overall = Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length);
  const ring = overall >= 90 ? "#10b981" : overall >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        icon={ShieldCheck}
        title="SEO Health"
        subtitle={`Live audit of ${siteConfig.url} — titles, descriptions, canonicals, OG images, H1s and structured data.`}
      />

      {/* Overall score */}
      <div className="mb-6 flex items-center gap-6 rounded-xl border border-foreground/8 bg-card p-6">
        <div
          className="grid h-24 w-24 shrink-0 place-items-center rounded-full text-2xl font-extrabold"
          style={{ background: `conic-gradient(${ring} ${overall * 3.6}deg, rgba(127,127,127,0.12) 0)`, color: ring }}
        >
          <span className="grid h-[76px] w-[76px] place-items-center rounded-full bg-card">{overall}</span>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">Overall SEO score</p>
          <p className="text-sm text-foreground/55">
            Across {audits.length} key pages. Re-run any time — this audits the live site, not the code.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {infra.map((c) => (
              <span
                key={c.label}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  c.pass ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                }`}
              >
                {c.pass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Per-page audits */}
      <div className="space-y-4">
        {audits.map((a) => (
          <div key={a.path} className="overflow-hidden rounded-xl border border-foreground/8 bg-card">
            <div className="flex items-center justify-between border-b border-foreground/8 px-5 py-3.5">
              <p className="truncate font-mono text-sm font-semibold text-foreground">{a.path}</p>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  background: (a.score >= 90 ? "#10b981" : a.score >= 70 ? "#f59e0b" : "#ef4444") + "20",
                  color: a.score >= 90 ? "#10b981" : a.score >= 70 ? "#f59e0b" : "#ef4444",
                }}
              >
                {a.score}/100
              </span>
            </div>
            <div className="grid gap-x-6 gap-y-2 p-5 sm:grid-cols-2">
              {a.checks.map((c) => (
                <div key={c.label} className="flex items-start gap-2 text-sm">
                  {c.pass && !c.warn ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : c.pass && c.warn ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <span className="min-w-0">
                    <span className="font-medium text-foreground">{c.label}</span>{" "}
                    <span className="break-all text-foreground/45">— {c.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
