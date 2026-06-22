import { NextResponse } from "next/server";
import { imageExt } from "@/lib/webp";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { uploadToBucket } from "@/lib/storageUpload";
import { writerifyAuthorized, writerifyConfigured } from "@/lib/writerify";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "media";

/**
 * Writerify image upload (multipart form-data, bearer-authenticated). Accepts
 * any image, converts to optimized WebP, stores it in Supabase Storage and
 * returns the public URL — Writerify rewrites local image refs to this URL
 * before publishing.
 */
export async function POST(req: Request) {
  if (!writerifyConfigured) {
    return NextResponse.json({ error: "Publishing token not configured." }, { status: 503 });
  }
  if (!writerifyAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized — bad or missing bearer token." }, { status: 401 });
  }
  if (!adminConfigured) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  try {
    const form = await req.formData();
    // Accept any field name — grab the first uploaded file.
    let file: File | null = null;
    for (const value of form.values()) {
      if (value instanceof File) {
        file = value;
        break;
      }
    }
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image." }, { status: 400 });
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

    // Generous response shape for cross-version compatibility.
    return NextResponse.json({ ok: true, success: true, url, src: url, link: url, location: url, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
