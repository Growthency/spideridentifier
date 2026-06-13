import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { writerifyAuthorized, writerifyConfigured } from "@/lib/writerify";

export const runtime = "nodejs";

/**
 * Writerify scheduling endpoint (POST, bearer-authenticated):
 *   { id, scheduledAt, publishAt, status }
 * Sets a post's publish time and status. A future publish time + "published"
 * status reads as Scheduled — the data layer hides it until that moment, then
 * it goes live automatically (no cron needed).
 */
export async function POST(req: Request) {
  if (!writerifyConfigured) {
    return NextResponse.json({ error: "Publishing token not configured." }, { status: 503 });
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

  const id = typeof body.id === "string" ? body.id : "";
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!id && !slug) return NextResponse.json({ error: "Missing post id or slug." }, { status: 400 });

  const dateStr =
    (typeof body.publishAt === "string" && body.publishAt) ||
    (typeof body.scheduledAt === "string" && body.scheduledAt) ||
    (typeof body.scheduled_at === "string" && body.scheduled_at) ||
    "";
  const parsed = dateStr ? new Date(dateStr) : null;
  const validDate = parsed && !isNaN(+parsed) ? parsed : null;

  const rawStatus = (typeof body.status === "string" ? body.status : "").toLowerCase();
  const status: "draft" | "published" = /draft|unpublish/.test(rawStatus) ? "draft" : "published";

  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (validDate) patch.published_at = validDate.toISOString();

  try {
    const supabase = createAdminClient()!;
    let query = supabase.from("blog_posts").update(patch);
    query = id ? query.eq("id", id) : query.eq("slug", slug);
    const { data, error } = await query.select("id, slug, status, published_at").single();
    if (error) throw error;

    for (const path of ["/", "/blog", "/sitemap.xml", "/feed.xml"]) revalidatePath(path);
    if (data?.slug) revalidatePath(`/${data.slug}`);

    return NextResponse.json({ ok: true, success: true, ...data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Schedule failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
