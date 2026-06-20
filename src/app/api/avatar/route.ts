import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { imageExt } from "@/lib/webp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { uploadToBucket } from "@/lib/storageUpload";
import { ensureProfile } from "@/lib/ensureProfile";

export const runtime = "nodejs";

/** Logged-in user avatar upload → optimized WebP → 'scans' bucket → profile. */
export async function POST(req: Request) {
  if (!adminConfigured) return NextResponse.json({ error: "Storage not configured" }, { status: 503 });

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please choose an image" }, { status: 400 });
    }
    const data = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/jpeg";

    const admin = createAdminClient()!;
    const path = `avatars/${user.id}/${randomUUID()}.${imageExt(contentType)}`;
    const url = await uploadToBucket(admin, "scans", path, data, { contentType, upsert: true });
    // Heal a missing profile row first — UPDATE on zero rows is a silent
    // no-op, which is exactly how avatars used to vanish on reload.
    await ensureProfile(user);
    const { error } = await admin.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    if (error) throw error;
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
