/**
 * Image helpers.
 *
 * NOTE (Cloudflare migration): this used to convert uploads to optimized WebP
 * with `sharp`. `sharp` is a native binary and cannot run on the Cloudflare
 * Workers runtime, so we no longer convert server-side — images are stored in
 * their original format. Callers use `imageExt()` to keep the correct
 * extension + content-type.
 *
 * To re-introduce optimization later without `sharp`, do it client-side before
 * upload, via Cloudflare Images, or with a WASM codec (e.g. @jsquash/webp).
 */

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/** File extension for a given image content-type (defaults to jpg). */
export function imageExt(contentType?: string | null): string {
  return EXT_BY_TYPE[(contentType || "").toLowerCase()] ?? "jpg";
}

/**
 * Pass-through kept for backwards compatibility with existing callers.
 * Returns the input buffer unchanged (no native image processing on Workers).
 */
export async function toWebp(
  input: Buffer,
  _opts: { maxWidth?: number; quality?: number } = {}
): Promise<Buffer> {
  return input;
}
