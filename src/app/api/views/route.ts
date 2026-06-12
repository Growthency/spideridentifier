import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Post view counter. { slug, count } — when count is true the counter is
 * incremented (once per browser session, enforced client-side), otherwise
 * just returns the current total.
 */
export async function POST(req: Request) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ views: 0 });

  try {
    const body = await req.json();
    const slug = String(body.slug || "");
    if (!/^[a-z0-9-]{1,120}$/i.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const { data } = await admin.from("post_views").select("views").eq("slug", slug).maybeSingle();
    let views = Number(data?.views ?? 0);

    if (body.count) {
      views += 1;
      await admin.from("post_views").upsert({ slug, views });
    }

    return NextResponse.json({ views });
  } catch {
    return NextResponse.json({ views: 0 });
  }
}
