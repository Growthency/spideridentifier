import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Update the signed-in user's display name. Goes through the server with an
 * allow-list of fields so plan/credits/subscription can never be changed
 * from the browser.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  try {
    const body = await req.json();
    const fullName = typeof body.full_name === "string" ? body.full_name.trim().slice(0, 80) : null;
    if (!fullName) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const { error } = await admin.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true, full_name: fullName });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Save failed" }, { status: 500 });
  }
}
