import sharp from "sharp";

/**
 * Convert any uploaded image buffer to an optimized WebP.
 * Respects EXIF orientation and caps very large images.
 */
export async function toWebp(
  input: Buffer,
  opts: { maxWidth?: number; quality?: number } = {}
): Promise<Buffer> {
  const { maxWidth = 1600, quality = 82 } = opts;
  return sharp(input)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
}
