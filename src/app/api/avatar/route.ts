import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { toWebp } from "@/lib/webp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { uploadToBucket } from "@/lib/storageUpload";

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
    const input = Buffer.from(await file.arrayBuffer());
    const webp = await toWebp(input, { maxWidth: 256, quality: 82 });

    const admin = createAdminClient()!;
    const path = `avatars/${user.id}/${randomUUID()}.webp`;
    const url = await uploadToBucket(admin, "scans", path, webp, { contentType: "image/webp", upsert: true });
    await admin.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
