/**
 * Convert every raster image (PNG/JPG/JPEG/TIFF/GIF) under a folder to
 * optimized WebP — so the project only ever ships .webp assets.
 *
 * Usage:
 *   npm run convert:webp            # converts ./public
 *   node scripts/convert-to-webp.mjs ./some/folder --delete
 *
 * Pass --delete to remove the original files after a successful conversion.
 */
import { readdir, stat, readFile, writeFile, unlink } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--")) || "public";
const deleteOriginals = args.includes("--delete");
const exts = new Set([".png", ".jpg", ".jpeg", ".tiff", ".tif", ".gif", ".bmp"]);

let converted = 0;
let savedBytes = 0;

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) {
      await walk(full);
    } else if (exts.has(extname(entry).toLowerCase())) {
      await convert(full, info.size);
    }
  }
}

async function convert(file, originalSize) {
  const out = file.replace(/\.[^.]+$/, ".webp");
  try {
    const input = await readFile(file);
    const webp = await sharp(input).rotate().webp({ quality: 82, effort: 5 }).toBuffer();
    await writeFile(out, webp);
    converted++;
    savedBytes += originalSize - webp.length;
    console.log(`   ✓ ${file}  →  ${out}  (${(originalSize / 1024).toFixed(0)}KB → ${(webp.length / 1024).toFixed(0)}KB)`);
    if (deleteOriginals) await unlink(file);
  } catch (err) {
    console.error(`   ✖ ${file}: ${err.message}`);
  }
}

console.log(`\n🖼️  Converting images in "${target}" to WebP…\n`);
await walk(target);
console.log(
  converted === 0
    ? "\nNo raster images found — already WebP-only. 👍\n"
    : `\n✅ Converted ${converted} image(s). Saved ~${(savedBytes / 1024).toFixed(0)}KB.${deleteOriginals ? " Originals removed." : ""}\n`
);
