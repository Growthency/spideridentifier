import { slugify, readingTime } from "@/lib/utils";

/**
 * Writerify (https://writerify.org) publishing integration.
 *
 * Writerify is an external AI-content studio that publishes finished articles
 * to this site over HTTP, authenticated with a single shared bearer token.
 * These helpers verify that token and translate Writerify's article JSON —
 * whose exact field names vary by version — into our blog_posts shape.
 */

export const writerifyConfigured = Boolean(process.env.WRITERIFY_API_TOKEN);

/** Constant-time string compare (runtime-agnostic — no node:crypto). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Constant-time bearer-token check against WRITERIFY_API_TOKEN. */
export function writerifyAuthorized(req: Request): boolean {
  const token = process.env.WRITERIFY_API_TOKEN;
  if (!token) return false;
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return false;
  return safeEqual(match[1].trim(), token);
}

type Json = Record<string, unknown>;

/** First non-empty string (or number coerced to string) among the given keys. */
function pickString(obj: Json, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

function pickBool(obj: Json, ...keys: string[]): boolean | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      if (/^(true|yes|1)$/i.test(v)) return true;
      if (/^(false|no|0)$/i.test(v)) return false;
    }
  }
  return undefined;
}

/** Category/tag values may be strings or objects like { name } / { slug }. */
function labelOf(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (v && typeof v === "object") {
    const o = v as Json;
    return (pickString(o, "name", "title", "label", "slug") ?? "").trim();
  }
  return "";
}

function pickTags(obj: Json): string[] {
  for (const k of ["tags", "keywords", "labels"]) {
    const v = obj[k];
    if (Array.isArray(v)) return v.map(labelOf).filter(Boolean);
    if (typeof v === "string" && v.trim()) return v.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function pickCategory(obj: Json): string | undefined {
  const single = pickString(obj, "category", "categoryName", "category_name", "primaryCategory");
  if (single) return single;
  const arr = obj["categories"];
  if (Array.isArray(arr) && arr.length) {
    const first = labelOf(arr[0]);
    if (first) return first;
  }
  return undefined;
}

const stripTags = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export interface NormalizedArticle {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author_name: string;
  author_role: string;
  author_avatar: string;
  read_time: number;
  region: string;
  level: string;
  cover_accent: string;
  status: "draft" | "published";
  is_featured: boolean;
  published_at: string;
  meta_title: string;
  meta_description: string;
  featured_image: string;
  access_type: "free" | "premium";
  layout: "full" | "sidebar";
  custom_css: string;
  custom_schema: string;
}

/**
 * Map an incoming Writerify article (loose JSON) onto our blog_posts columns.
 * Returns null when there isn't even a title to work with.
 */
export function normalizeArticle(body: Json): NormalizedArticle | null {
  const title = pickString(body, "title", "name", "headline", "heading");
  if (!title) return null;

  const content =
    pickString(body, "content", "html", "contentHtml", "content_html", "body", "bodyHtml", "markdown", "md") ?? "";

  const slug = slugify(pickString(body, "slug", "permalink", "path") ?? title);

  const metaDescription = pickString(body, "metaDescription", "meta_description", "seoDescription", "seo_description") ?? "";
  const excerpt =
    pickString(body, "excerpt", "description", "summary", "subtitle") ||
    metaDescription ||
    stripTags(content).slice(0, 158);

  // Scheduling: a future publish date + "published" status reads as scheduled
  // (the data layer hides future-dated posts until their time).
  const rawStatus = (pickString(body, "status", "state", "visibility") ?? "").toLowerCase();
  const dateStr = pickString(body, "publishAt", "publishedAt", "published_at", "scheduledAt", "scheduled_at", "date");
  const parsed = dateStr ? new Date(dateStr) : null;
  const validDate = parsed && !isNaN(+parsed) ? parsed : null;
  const status: "draft" | "published" = /draft|unpublish/.test(rawStatus) ? "draft" : "published";

  const accessRaw = (pickString(body, "accessType", "access_type", "access", "tier") ?? "").toLowerCase();
  const access_type: "free" | "premium" = /premium|paid|pro|member/.test(accessRaw) ? "premium" : "free";

  const layoutRaw = (pickString(body, "layout", "template") ?? "").toLowerCase();
  const layout: "full" | "sidebar" = layoutRaw === "full" || layoutRaw.includes("full") ? "full" : "sidebar";

  return {
    title,
    slug,
    content,
    excerpt: excerpt.trim(),
    category: pickCategory(body) ?? "Species Guide",
    tags: pickTags(body),
    author_name: pickString(body, "authorName", "author_name", "author") ?? "Marcus Webb",
    author_role: pickString(body, "authorRole", "author_role") ?? "Spider Researcher",
    author_avatar: pickString(body, "authorAvatar", "author_avatar", "authorImage") ?? "",
    read_time: Number(pickString(body, "readTime", "read_time", "readingTime")) || readingTime(stripTags(content) || excerpt),
    region: pickString(body, "region", "location") ?? "Worldwide",
    level: pickString(body, "level", "difficulty") ?? "Beginner",
    cover_accent: pickString(body, "coverAccent", "cover_accent", "accent") ?? "gold",
    status,
    is_featured: pickBool(body, "isFeatured", "is_featured", "featured") ?? false,
    published_at: (validDate ?? new Date()).toISOString(),
    meta_title: pickString(body, "metaTitle", "meta_title", "seoTitle", "seo_title") ?? "",
    meta_description: metaDescription,
    featured_image:
      pickString(body, "featuredImage", "featured_image", "coverImage", "cover_image", "image", "thumbnail", "ogImage") ?? "",
    access_type,
    layout,
    custom_css: pickString(body, "customCss", "custom_css") ?? "",
    custom_schema: pickString(body, "customSchema", "custom_schema", "jsonLd") ?? "",
  };
}
