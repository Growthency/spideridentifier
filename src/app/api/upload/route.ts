import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { imageExt } from "@/lib/webp";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { uploadToBucket } from "@/lib/storageUpload";

export const runtime = "nodejs";

const BUCKET = "media";

/**
 * Admin-only image upload. Accepts ANY image format, converts it to an
 * optimized WebP with sharp, and stores it in Supabase Storage — so the
 * database only ever holds .webp URLs.
 */
export async function POST(req: Request) {
  if (!adminConfigured) {
    return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const data = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/jpeg";

    const supabase = createAdminClient()!;
    const path = `uploads/${crypto.randomUUID()}.${imageExt(contentType)}`;
    const url = await uploadToBucket(supabase, BUCKET, path, data, {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });
    return NextResponse.json({ url, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
