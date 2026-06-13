import { NextResponse } from "next/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { writerifyAuthorized, writerifyConfigured } from "@/lib/writerify";

export const runtime = "nodejs";

/**
 * Writerify drafts feed (GET, bearer-authenticated):
 *   { drafts: [{ id, title, excerpt, slug }] }
 * Lets Writerify list existing drafts so they can be scheduled.
 */
export async function GET(req: Request) {
  if (!writerifyConfigured) {
    return NextResponse.json({ error: "Publishing token not configured." }, { status: 503 });
  }
  if (!writerifyAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized — bad or missing bearer token." }, { status: 401 });
  }
  if (!adminConfigured) {
    return NextResponse.json({ ok: true, drafts: [] });
  }

  try {
    const supabase = createAdminClient()!;
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, slug")
      .eq("status", "draft")
      .order("published_at", { ascending: false });
    if (error) throw error;

    const drafts = (data ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      excerpt: d.excerpt ?? "",
      slug: d.slug,
    }));
    return NextResponse.json({ ok: true, drafts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load drafts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
