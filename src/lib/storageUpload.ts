import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Upload to Supabase Storage, creating the bucket on the fly if it doesn't
 * exist yet — so image uploads work even when the SQL setup was only
 * partially run. Returns the public URL.
 */
export async function uploadToBucket(
  admin: SupabaseClient,
  bucket: string,
  path: string,
  data: Buffer | Uint8Array,
  options: { contentType?: string; upsert?: boolean; cacheControl?: string } = {}
): Promise<string> {
  const attempt = () => admin.storage.from(bucket).upload(path, data, options);

  let { error } = await attempt();
  if (error && /bucket not found/i.test(error.message ?? "")) {
    // Self-heal: service role can create the missing public bucket.
    await admin.storage.createBucket(bucket, { public: true }).catch(() => {});
    ({ error } = await attempt());
  }
  if (error) throw new Error(error.message || "Upload failed");

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(path);
  return pub.publicUrl;
}
