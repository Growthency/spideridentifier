import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureProfile } from "@/lib/ensureProfile";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Toggle a saved article for the signed-in user. Server-side so the
 * profile row is healed first — no foreign-key surprises in the browser.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to save articles" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  try {
    const { slug } = await req.json();
    if (typeof slug !== "string" || !/^[a-z0-9-]{1,120}$/i.test(slug)) {
      return NextResponse.json({ error: "Invalid article" }, { status: 400 });
    }

    await ensureProfile(user);

    const { data: existing } = await admin
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_slug", slug)
      .maybeSingle();

    if (existing) {
      const { error } = await admin.from("favorites").delete().eq("id", existing.id);
      if (error) throw error;
      return NextResponse.json({ saved: false });
    }

    const { error } = await admin.from("favorites").insert({ user_id: user.id, post_slug: slug });
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (e) {
    const raw =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Could not save";
    const friendly = /schema cache|does not exist/i.test(raw)
      ? "Database setup incomplete — run supabase/00-run-everything.sql in the Supabase SQL Editor once."
      : raw;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
