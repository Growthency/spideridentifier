import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/site";
import { writerifyAuthorized, writerifyConfigured, normalizeArticle } from "@/lib/writerify";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Bust the ISR cache so a freshly published article is live immediately. */
function revalidatePost(slug?: string | null, oldSlug?: string | null) {
  for (const path of ["/", "/blog", "/sitemap.xml", "/feed.xml"]) revalidatePath(path);
  if (slug) revalidatePath(`/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/${oldSlug}`);
}

function friendlyDbError(message: string): string {
  return /schema cache|does not exist/i.test(message)
    ? "Database setup incomplete — run supabase/00-run-everything.sql in the Supabase SQL Editor once, then retry."
    : message;
}

/**
 * Writerify → site publish endpoint.
 * POST a finished article (bearer-authenticated); we create it, or update the
 * existing post when the slug (or supplied id) already exists. Idempotent.
 */
export async function POST(req: Request) {
  if (!writerifyConfigured) {
    return NextResponse.json({ error: "Publishing token not configured. Set WRITERIFY_API_TOKEN." }, { status: 503 });
  }
  if (!writerifyAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized — bad or missing bearer token." }, { status: 401 });
  }
  if (!adminConfigured) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const article = normalizeArticle(body);
  if (!article) {
    return NextResponse.json({ error: "Missing article title." }, { status: 400 });
  }

  const supabase = createAdminClient()!;
  const suppliedId = typeof body.id === "string" ? body.id : undefined;

  try {
    // Find an existing post by id (preferred) or slug → update; else insert.
    let existing: { id: string; slug: string } | null = null;
    if (suppliedId) {
      const { data } = await supabase.from("blog_posts").select("id, slug").eq("id", suppliedId).maybeSingle();
      existing = data ?? null;
    }
    if (!existing) {
      const { data } = await supabase.from("blog_posts").select("id, slug").eq("slug", article.slug).maybeSingle();
      existing = data ?? null;
    }

    let saved: { id: string; slug: string } | null = null;
    if (existing) {
      const { data, error } = await supabase
        .from("blog_posts")
        .update({ ...article, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("id, slug")
        .single();
      if (error) throw error;
      saved = data;
      revalidatePost(saved.slug, existing.slug);
    } else {
      const { data, error } = await supabase.from("blog_posts").insert(article).select("id, slug").single();
      if (error) throw error;
      saved = data;
      revalidatePost(saved.slug);
    }

    const url = `${siteConfig.url}/${saved.slug}`;
    // Return a generous shape so any Writerify version finds the fields it reads.
    return NextResponse.json({
      ok: true,
      success: true,
      id: saved.id,
      slug: saved.slug,
      url,
      link: url,
      permalink: url,
      status: article.status,
      updated: Boolean(existing),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Publish failed";
    return NextResponse.json({ error: friendlyDbError(message) }, { status: 500 });
  }
}
