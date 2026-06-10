import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Demo mode (no DB yet): accept gracefully so the UI works in preview.
    if (!adminConfigured) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const supabase = createAdminClient()!;
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email: parsed.data.email }, { onConflict: "email" });

    if (error) throw error;
    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
  }
}
