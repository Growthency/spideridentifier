/**
 * Source license-safe spider photos (CC0 / Public Domain / CC-BY[-SA]) from
 * Wikimedia Commons, convert them to optimized WebP, and save them into
 * /public/images/species. Writes CREDITS.json for attribution.
 *
 * Usage:  node --experimental-strip-types scripts/fetch-images.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { speciesLibrary } from "../src/content/species.ts";

const OUT = "public/images/species";
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "SpiderIdentifier/1.0 (educational image sourcing)";
const ACCEPT = /cc0|public domain|\bpd\b|cc[\s-]?by/i;
const REJECT = /non-free|fair use|all rights reserved|copyright/i;

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return res.json();
}

const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function findImage(query) {
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1100",
  });
  const pages = Object.values(data?.query?.pages ?? {}).sort(
    (a, b) => (a.index ?? 99) - (b.index ?? 99)
  );
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/^image\/(jpe?g|png)$/.test(ii.mime || "")) continue;
    const md = ii.extmetadata || {};
    const license = strip(md.LicenseShortName?.value || md.License?.value || "");
    if (!ACCEPT.test(license) || REJECT.test(license)) continue;
    return {
      title: p.title,
      thumb: ii.thumburl || ii.url,
      license: license || "see source",
      artist: strip(md.Artist?.value).slice(0, 140) || "Unknown",
      source: ii.descriptionurl || ii.url,
    };
  }
  return null;
}

await mkdir(OUT, { recursive: true });
const credits = [];
let ok = 0;

for (const s of speciesLibrary) {
  try {
    const hit =
      (await findImage(s.scientific_name)) || (await findImage(`${s.common_name} spider`));
    if (!hit) {
      console.log(`  ✖ ${s.slug}: no license-safe image found`);
      continue;
    }
    const res = await fetch(hit.thumb, { headers: { "User-Agent": UA } });
    const buf = Buffer.from(await res.arrayBuffer());
    const webp = await sharp(buf)
      .rotate()
      .resize({ width: 1000, height: 750, fit: "cover", position: "centre", withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toBuffer();
    await writeFile(join(OUT, `${s.slug}.webp`), webp);
    credits.push({ slug: s.slug, file: `${s.slug}.webp`, ...hit });
    ok++;
    console.log(`  ✓ ${s.slug}  ${(webp.length / 1024).toFixed(0)}KB  [${hit.license}]`);
  } catch (e) {
    console.log(`  ✖ ${s.slug}: ${e.message}`);
  }
}

await writeFile(join(OUT, "CREDITS.json"), JSON.stringify(credits, null, 2));
console.log(`\n✅ ${ok}/${speciesLibrary.length} species images saved to ${OUT}\n`);
