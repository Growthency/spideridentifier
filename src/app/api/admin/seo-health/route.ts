import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getBlogPosts, getSpecies } from "@/lib/data";
import { siteConfig } from "@/lib/site";

export const maxDuration = 60;

export type Severity = "critical" | "warning" | "info";
export type Category =
  | "meta"
  | "og"
  | "twitter"
  | "headings"
  | "images"
  | "schema"
  | "technical"
  | "performance"
  | "links";

export interface Issue {
  severity: Severity;
  category: Category;
  label: string;
  hint: string;
}
export interface Passed {
  category: Category;
  label: string;
}
export interface PageResult {
  path: string;
  status: number;
  score: number;
  sizeKb: number;
  title: string;
  issues: Issue[];
  passed: Passed[];
}
export interface GlobalCheck {
  label: string;
  pass: boolean;
  detail: string;
}

const STATIC_ROUTES = ["", "/species", "/anatomy", "/blog", "/pricing", "/about", "/contact", "/privacy", "/terms", "/refund", "/disclaimer"];

async function allPaths(): Promise<string[]> {
  const [posts, species] = await Promise.all([getBlogPosts(), getSpecies()]);
  return [
    ...STATIC_ROUTES.map((p) => p || "/"),
    ...posts.map((p) => `/blog/${p.slug}`),
    ...species.map((s) => `/species/${s.slug}`),
  ];
}

const pick = (html: string, re: RegExp) => re.exec(html)?.[1]?.trim() ?? "";

function auditHtml(path: string, status: number, html: string): PageResult {
  const issues: Issue[] = [];
  const passed: Passed[] = [];
  const ok = (category: Category, label: string) => passed.push({ category, label });
  const bad = (severity: Severity, category: Category, label: string, hint: string) =>
    issues.push({ severity, category, label, hint });

  const sizeKb = Math.round(Buffer.byteLength(html) / 1024);

  /* ── Meta Tags (5) ── */
  const title = pick(html, /<title[^>]*>([^<]*)<\/title>/i);
  if (!title) bad("critical", "meta", "Missing <title> tag", "Every page needs a unique, descriptive title");
  else ok("meta", "Title present");
  if (title) {
    if (title.length > 60)
      bad("warning", "meta", `Title is too long (${title.length} chars, max 60)`, "Shorten title to 60 characters or less for full SERP display");
    else if (title.length < 10)
      bad("warning", "meta", `Title is too short (${title.length} chars, min 10)`, "Write a more descriptive title");
    else ok("meta", "Title length");
  }
  const desc = pick(html, /<meta name="description" content="([^"]*)"/i);
  if (!desc) bad("critical", "meta", "Missing meta description", "Add a compelling 120-160 character description");
  else ok("meta", "Meta description present");
  if (desc) {
    if (desc.length < 120)
      bad("warning", "meta", `Meta description too short (${desc.length} chars, min 120)`, "Expand meta description to at least 120 characters");
    else if (desc.length > 160)
      bad("warning", "meta", `Meta description too long (${desc.length} chars, max 160)`, "Shorten meta description to 160 characters for full SERP display");
    else ok("meta", "Meta description length");
  }
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/i);
  if (!canonical) bad("critical", "meta", "Missing canonical tag", "Add a self-referencing canonical URL");
  else ok("meta", "Canonical tag");

  /* ── Open Graph (5) ── */
  for (const [prop, label] of [
    ["og:title", "OG title"],
    ["og:description", "OG description"],
    ["og:image", "OG image"],
    ["og:url", "OG URL"],
    ["og:type", "OG type"],
  ] as const) {
    const v = pick(html, new RegExp(`<meta property="${prop}" content="([^"]*)"`, "i"));
    if (v) ok("og", label);
    else bad("warning", "og", `Missing ${prop}`, "Open Graph tags control how links look when shared");
  }

  /* ── Twitter Cards (4) ── */
  const twCard = pick(html, /<meta name="twitter:card" content="([^"]*)"/i);
  if (twCard) ok("twitter", "Twitter card type");
  else bad("warning", "twitter", "Missing twitter:card", "Set twitter:card to summary_large_image");
  for (const [name, label] of [
    ["twitter:title", "Twitter title"],
    ["twitter:description", "Twitter description"],
    ["twitter:image", "Twitter image"],
  ] as const) {
    const v = pick(html, new RegExp(`<meta name="${name}" content="([^"]*)"`, "i"));
    if (v) ok("twitter", label);
    else bad("info", "twitter", `Missing ${name}`, "X falls back to Open Graph, but explicit tags are safer");
  }

  /* ── Headings (5) ── */
  const h1s = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) ?? [];
  if (h1s.length === 1) ok("headings", "Exactly one H1");
  else if (h1s.length === 0) bad("critical", "headings", "Page has no H1 tag", "Add exactly one <h1> describing the page");
  else bad("warning", "headings", `Page has ${h1s.length} H1 tags (should be exactly 1)`, "Use only one <h1> per page for clear hierarchy");
  const h1Text = (h1s[0] ?? "").replace(/<[^>]+>/g, "").trim();
  if (h1s.length > 0) {
    if (h1Text) ok("headings", "H1 has text");
    else bad("warning", "headings", "H1 tag is empty", "The H1 must contain visible text");
    if (h1Text.length <= 70) ok("headings", "H1 length");
    else bad("info", "headings", `H1 is long (${h1Text.length} chars)`, "Keep the H1 under ~70 characters");
  }
  const hasH2 = /<h2[\s>]/i.test(html);
  if (hasH2) ok("headings", "Has H2 headings");
  else bad("info", "headings", "No H2 headings found", "Break content up with H2 subheadings");
  const firstH1 = html.search(/<h1[\s>]/i);
  const skip = firstH1 >= 0 && !/<h2[\s>]/i.test(html) && /<h3[\s>]/i.test(html);
  if (!skip) ok("headings", "Heading hierarchy");
  else bad("warning", "headings", "Heading hierarchy skips level (h1 → h3)", "Use sequential heading levels without skipping (h1→h2→h3)");

  /* ── Images (2) ── */
  const imgs = html.match(/<img [^>]*>/gi) ?? [];
  const noAlt = imgs.filter((t) => !/alt="/i.test(t)).length;
  if (imgs.length === 0 || noAlt === 0) ok("images", "All images have alt text");
  else bad("info", "images", `${noAlt} of ${imgs.length} images missing alt text`, "Add descriptive alt attributes for accessibility and image SEO");
  if (imgs.length <= 60) ok("images", "Reasonable image count");
  else bad("info", "images", `Heavy page: ${imgs.length} images`, "Consider lazy-loading or trimming media");

  /* ── Structured Data (4) ── */
  const ldBlocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) ?? [];
  if (ldBlocks.length > 0) ok("schema", "JSON-LD present");
  else bad("warning", "schema", "No structured data (JSON-LD)", "Add schema.org markup for rich results");
  let parsedLd: unknown = null;
  const firstLd = ldBlocks[0];
  if (firstLd) {
    try {
      parsedLd = JSON.parse(firstLd.replace(/<script type="application\/ld\+json">/i, "").replace(/<\/script>/i, ""));
      ok("schema", "JSON-LD parses");
    } catch {
      bad("warning", "schema", "JSON-LD does not parse", "Fix the syntax error in the structured data");
    }
    const obj = (Array.isArray(parsedLd) ? parsedLd[0] : parsedLd) as Record<string, unknown> | null;
    if (obj && obj["@context"]) ok("schema", "Has @context");
    else if (parsedLd) bad("info", "schema", "JSON-LD missing @context", "Include @context: https://schema.org");
    if (obj && obj["@type"]) ok("schema", "Has @type");
    else if (parsedLd) bad("info", "schema", "JSON-LD missing @type", "Declare the schema @type");
  }

  /* ── Technical (5) ── */
  if (/<meta name="viewport"/i.test(html)) ok("technical", "Viewport meta");
  else bad("warning", "technical", "Missing viewport meta", "Required for mobile rendering");
  if (/<meta charset/i.test(html)) ok("technical", "Charset declared");
  else bad("info", "technical", "Missing charset meta", "Declare UTF-8 explicitly");
  if (/<html[^>]+lang=/i.test(html)) ok("technical", "HTML lang attribute");
  else bad("warning", "technical", "Missing lang attribute", "Set <html lang=\"en\"> for accessibility and SEO");
  if (/<meta name="robots"[^>]*noindex/i.test(html)) bad("critical", "technical", "Page is set to noindex", "Remove noindex unless intentional");
  else ok("technical", "Indexable (no noindex)");
  const insecure = (html.match(/(?:src|href)="http:\/\//gi) ?? []).length;
  if (insecure === 0) ok("technical", "No insecure http:// references");
  else bad("warning", "technical", `${insecure} insecure http:// references`, "Serve every asset and link over HTTPS");

  /* ── Performance (2) ── */
  if (sizeKb <= 300) ok("performance", "HTML size");
  else bad("warning", "performance", `Page HTML is ${sizeKb} KB (max 300)`, "Trim server-rendered HTML for faster first byte");
  const scriptTags = (html.match(/<script[\s>]/gi) ?? []).length;
  if (scriptTags <= 40) ok("performance", "Script tag count");
  else bad("info", "performance", `${scriptTags} script tags`, "Audit third-party and inline scripts");

  /* ── Internal Links (1) ── */
  const internal = (html.match(/href="\/(?!\/)[^"]*"/g) ?? []).length;
  if (internal >= 3) ok("links", "Internal links present");
  else bad("warning", "links", `Only ${internal} internal links`, "Add contextual links to related pages");

  if (status !== 200) bad("critical", "technical", `HTTP ${status}`, "The page must return 200");
  else ok("technical", "HTTP 200");

  // critical −25 · warning −6 · info −3 (floor 0)
  const score = Math.max(
    0,
    100 - issues.reduce((s, i) => s + (i.severity === "critical" ? 25 : i.severity === "warning" ? 6 : 3), 0)
  );

  return { path, status, score, sizeKb, title: title || path, issues, passed };
}

async function auditPage(path: string): Promise<PageResult> {
  try {
    const res = await fetch(`${siteConfig.url}${path === "/" ? "" : path}`, {
      cache: "no-store",
      headers: { "User-Agent": "SpiderIdentifier-SEO-Health" },
    });
    const html = await res.text();
    return auditHtml(path, res.status, html);
  } catch {
    return {
      path,
      status: 0,
      score: 0,
      sizeKb: 0,
      title: path,
      issues: [{ severity: "critical", category: "technical", label: "Page unreachable", hint: "Could not fetch the page — is the site deployed?" }],
      passed: [],
    };
  }
}

/** Server-side global checks (the rest derive from page results client-side). */
async function globalChecks(): Promise<GlobalCheck[]> {
  const head = async (path: string) => {
    try {
      return await fetch(`${siteConfig.url}${path}`, { cache: "no-store" });
    } catch {
      return null;
    }
  };
  const [robots, sitemap, favicon, home] = await Promise.all([head("/robots.txt"), head("/sitemap.xml"), head("/icon.svg"), head("/")]);

  const secHeaders = ["x-content-type-options", "x-frame-options", "referrer-policy"];
  const present = home ? secHeaders.filter((h) => home.headers.get(h)).length : 0;

  return [
    { label: "Robots Txt", pass: Boolean(robots?.ok), detail: robots?.ok ? "robots.txt is accessible" : "robots.txt unreachable" },
    { label: "Sitemap Xml", pass: Boolean(sitemap?.ok), detail: sitemap?.ok ? "sitemap.xml is accessible" : "sitemap.xml unreachable" },
    { label: "Favicon", pass: Boolean(favicon?.ok), detail: favicon?.ok ? "icon.svg exists" : "favicon missing" },
    { label: "Security Headers", pass: present === 3, detail: `${present}/3 security headers present` },
  ];
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "audit");

    if (action === "paths") {
      return NextResponse.json({ paths: await allPaths() });
    }

    if (action === "global") {
      return NextResponse.json({ checks: await globalChecks() });
    }

    if (action === "audit") {
      const paths: string[] = (body.paths ?? []).slice(0, 25);
      if (!paths.length) return NextResponse.json({ error: "paths required" }, { status: 400 });
      const pages: PageResult[] = [];
      const BATCH = 6;
      for (let i = 0; i < paths.length; i += BATCH) {
        pages.push(...(await Promise.all(paths.slice(i, i + BATCH).map(auditPage))));
      }
      return NextResponse.json({ pages });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Audit failed" }, { status: 500 });
  }
}
