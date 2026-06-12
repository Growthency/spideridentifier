import { NextResponse } from "next/server";
import { getSessionUser, getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Post a comment on an article — signed-in users only, written server-side. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  try {
    const payload = await req.json();
    const slug = String(payload.slug || "");
    const body = String(payload.body || "").trim();
    if (!/^[a-z0-9-]{1,120}$/i.test(slug)) return NextResponse.json({ error: "Invalid post" }, { status: 400 });
    if (body.length < 2 || body.length > 2000) {
      return NextResponse.json({ error: "Comment must be 2–2000 characters" }, { status: 400 });
    }

    const profile = await getProfile();
    const author = profile?.full_name?.trim() || user.email?.split("@")[0] || "Reader";

    const { data, error } = await admin
      .from("comments")
      .insert({ post_slug: slug, user_id: user.id, author_name: author, body })
      .select("id, author_name, body, created_at")
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, comment: data });
  } catch (e) {
    const raw =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Could not post comment";
    const friendly = /schema cache|does not exist/i.test(raw)
      ? "Comments table missing — run supabase/admin-schema.sql once."
      : raw;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
