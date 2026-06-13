import { NextResponse } from "next/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { getSiteContent } from "@/lib/siteContent";
import { DEFAULT_EDITOR_OPTIONS, type EditorOptions } from "@/lib/siteDefaults";
import { slugify } from "@/lib/utils";
import { writerifyAuthorized, writerifyConfigured } from "@/lib/writerify";

export const runtime = "nodejs";

/**
 * Writerify categories feed (GET, bearer-authenticated):
 *   { categories: [{ id, name, slug, count }] }
 * Combines the admin-managed category list with live per-category post counts.
 */
export async function GET(req: Request) {
  if (!writerifyConfigured) {
    return NextResponse.json({ error: "Publishing token not configured." }, { status: 503 });
  }
  if (!writerifyAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized — bad or missing bearer token." }, { status: 401 });
  }

  const counts = new Map<string, number>();
  if (adminConfigured) {
    try {
      const supabase = createAdminClient()!;
      const { data } = await supabase.from("blog_posts").select("category");
      for (const row of data ?? []) {
        const c = (row.category as string) || "";
        if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
      }
    } catch {
      // counts stay at 0 if the table isn't ready
    }
  }

  const options = await getSiteContent<EditorOptions>("editor_options", DEFAULT_EDITOR_OPTIONS);
  // Union: admin list first, then any category that only exists on posts.
  const names = [...new Set([...(options.categories ?? []), ...counts.keys()])];

  const categories = names.map((name) => {
    const slug = slugify(name);
    return { id: slug, name, slug, count: counts.get(name) ?? 0 };
  });

  return NextResponse.json({ ok: true, categories });
}
