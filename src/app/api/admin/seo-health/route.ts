import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getBlogPosts, getSpecies } from "@/lib/data";
import { siteConfig } from "@/lib/site";

export const maxDuration = 60;

export type Severity = "critical" | "warning" | "info";

export interface Issue {
  severity: Severity;
  label: string;
  detail: string;
}

export interface PageResult {
  path: string;
  status: number;
  score: number;
  sizeKb: number;
  title: string;
  issues: Issue[];
  passed: string[];
}

export interface GlobalCheck {
  label: string;
  pass: boolean;
  detail: string;
}

const STATIC_ROUTES = ["", "/species", "/anatomy", "/blog", "/pricing", "/about", "/contact", "/privacy", "/terms", "/refund", "/disclaimer"];

const pick = (html: string, re: RegExp) => re.exec(html)?.[1]?.trim() ?? "";

async function auditPage(path: string): Promise<PageResult> {
  const issues: Issue[] = [];
  const passed: string[] = [];
  const ok = (label: string) => passed.push(label);
  const bad = (severity: Severity, label: string, detail: string) => issues.push({ severity, label, detail });

  try {
    const res = await fetch(`${siteConfig.url}${path === "/" ? "" : path}`, {
      cache: "no-store",
      headers: { "User-Agent": "SpiderIdentifier-SEO-Health" },
    });
    const html = await res.text();
    const sizeKb = Math.round(Buffer.byteLength(html) / 1024);

    if (res.ok) ok("HTTP 200");
    else bad("critical", "HTTP status", `Returned ${res.status}`);

    const title = pick(html, /<title[^>]*>([^<]*)<\/title>/i);
    if (!title) bad("critical", "Title", "Missing");
    else if (title.length > 60) bad("warning", "Title length", `${title.length} chars (aim ≤ 60)`);
    else if (title.length < 10) bad("warning", "Title length", `${title.length} chars (aim ≥ 10)`);
    else ok("Title");

    const desc = pick(html, /<meta name="description" content="([^"]*)"/i);
    if (!desc) bad("critical", "Meta description", "Missing");
    else if (desc.length > 160) bad("warning", "Description length", `${desc.length} chars (aim ≤ 160)`);
    else if (desc.length < 50) bad("warning", "Description length", `${desc.length} chars (aim ≥ 50)`);
    else ok("Meta description");

    const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/i);
    if (!canonical) bad("critical", "Canonical tag", "Missing");
    else ok("Canonical tag");

    const ogImage = pick(html, /<meta property="og:image" content="([^"]*)"/i);
    if (!ogImage) bad("warning", "Open Graph image", "Missing — link previews will be plain");
    else ok("Open Graph image");

    const ogTitle = pick(html, /<meta property="og:title" content="([^"]*)"/i);
    if (!ogTitle) bad("warning", "Open Graph title", "Missing");
    else ok("Open Graph title");

    const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
    if (h1Count === 1) ok("Exactly one H1");
    else bad(h1Count === 0 ? "critical" : "warning", "H1 heading", `${h1Count} found (need exactly 1)`);

    if (html.includes("application/ld+json")) ok("Structured data (JSON-LD)");
    else bad("info", "Structured data", "No JSON-LD found");

    const viewport = pick(html, /<meta name="viewport" content="([^"]*)"/i);
    if (viewport) ok("Viewport meta");
    else bad("warning", "Viewport meta", "Missing — mobile rendering hurt");

    const imgs = html.match(/<img [^>]*>/gi) ?? [];
    const noAlt = imgs.filter((t) => !/alt="[^"]/i.test(t) && !/alt=""/i.test(t)).length;
    if (imgs.length === 0 || noAlt === 0) ok("Image alt text");
    else bad("info", "Image alt text", `${noAlt} of ${imgs.length} images missing alt`);

    if (sizeKb <= 300) ok("Page weight");
    else bad("info", "Page weight", `${sizeKb} KB of HTML (aim ≤ 300 KB)`);

    // critical −20 · warning −10 · info −4
    const score = Math.max(
      0,
      100 - issues.reduce((s, i) => s + (i.severity === "critical" ? 20 : i.severity === "warning" ? 10 : 4), 0)
    );

    return { path, status: res.status, score, sizeKb, title: title || path, issues, passed };
  } catch {
    return {
      path,
      status: 0,
      score: 0,
      sizeKb: 0,
      title: path,
      issues: [{ severity: "critical", label: "Fetch", detail: "Could not reach the page — is the site deployed?" }],
      passed: [],
    };
  }
}

async function checkEndpoint(path: string): Promise<GlobalCheck> {
  try {
    const res = await fetch(`${siteConfig.url}${path}`, { cache: "no-store" });
    return { label: path, pass: res.ok, detail: `Status ${res.status}` };
  } catch {
    return { label: path, pass: false, detail: "Unreachable" };
  }
}

/** Full-site SEO audit — every indexable URL plus the global endpoints. */
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [posts, species] = await Promise.all([getBlogPosts(), getSpecies()]);
  const paths = [
    ...STATIC_ROUTES.map((p) => p || "/"),
    ...posts.map((p) => `/blog/${p.slug}`),
    ...species.map((s) => `/species/${s.slug}`),
  ];

  const pages: PageResult[] = [];
  const BATCH = 6;
  for (let i = 0; i < paths.length; i += BATCH) {
    pages.push(...(await Promise.all(paths.slice(i, i + BATCH).map(auditPage))));
  }

  const globalChecks = await Promise.all(
    ["/robots.txt", "/sitemap.xml", "/feed.xml", "/manifest.webmanifest", "/indexnow-key.txt"].map(checkEndpoint)
  );

  return NextResponse.json({ scanned_at: new Date().toISOString(), pages, globalChecks });
}
