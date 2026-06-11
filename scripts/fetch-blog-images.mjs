/**
 * Source a license-safe (CC0/PD/CC-BY[-SA]) cover photo for each blog post
 * from Wikimedia Commons, convert to optimized WebP, save to
 * /public/images/blog. Writes CREDITS.json for attribution.
 *
 * Usage:  node scripts/fetch-blog-images.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const OUT = "public/images/blog";
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "SpiderIdentifier/1.0 (educational image sourcing)";
const ACCEPT = /cc0|public domain|\bpd\b|cc[\s-]?by/i;
const REJECT = /non-free|fair use|all rights reserved/i;
const strip = (h) => (h || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const api = async (p) =>
  (await fetch(`${API}?${new URLSearchParams({ format: "json", ...p })}`, { headers: { "User-Agent": UA } })).json();

// slug → Commons search queries (first license-safe photo wins)
const QUERIES = {
  "how-ai-spider-identifier-works": ["Argiope bruennichi web", "orb weaver spider web macro"],
  "spider-anatomy-explained": ["spider anatomy macro", "Araneus close up legs"],
  "black-widow-spider-identification": ["Latrodectus mactans female hourglass", "black widow spider female"],
  "brown-recluse-spider-identification": ["Loxosceles reclusa", "brown recluse spider"],
  "wolf-spider-vs-house-spider": ["Lycosidae wolf spider", "Hogna wolf spider"],
  "perfect-spider-photo-for-ai-identification": ["spider dew web macro", "spider macro photography"],
  "are-jumping-spiders-dangerous": ["Phidippus audax jumping spider", "Salticidae macro"],
  "spider-bites-identify-treat-when-to-worry": ["Cheiracanthium spider", "Tegenaria spider"],
};

async function findImage(queries) {
  for (const q of queries) {
    const d = await api({
      action: "query", generator: "search", gsrsearch: `${q} filetype:bitmap`, gsrnamespace: "6",
      gsrlimit: "15", prop: "imageinfo", iiprop: "url|mime|extmetadata", iiurlwidth: "1280",
    });
    const pages = Object.values(d?.query?.pages ?? {}).sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
    for (const p of pages) {
      const ii = p.imageinfo?.[0];
      if (!ii || !/^image\/(jpe?g|png)$/.test(ii.mime || "")) continue;
      if (/map|range|distribution|diagram|bite wound|stamp|illustration/i.test(p.title)) continue;
      const md = ii.extmetadata || {};
      const lic = strip(md.LicenseShortName?.value || md.License?.value);
      if (!ACCEPT.test(lic) || REJECT.test(lic)) continue;
      return { title: p.title, thumb: ii.thumburl || ii.url, license: lic, artist: strip(md.Artist?.value) || "Unknown", source: ii.descriptionurl || ii.url };
    }
  }
  return null;
}

await mkdir(OUT, { recursive: true });
const credits = [];
let ok = 0;
for (const [slug, queries] of Object.entries(QUERIES)) {
  try {
    const hit = await findImage(queries);
    if (!hit) { console.log(`  ✖ ${slug}: none`); continue; }
    const res = await fetch(hit.thumb, { headers: { "User-Agent": UA } });
    const buf = Buffer.from(await res.arrayBuffer());
    const webp = await sharp(buf).rotate().resize({ width: 1280, height: 720, fit: "cover", position: "centre", withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toBuffer();
    await writeFile(join(OUT, `${slug}.webp`), webp);
    credits.push({ slug, file: `${slug}.webp`, ...hit });
    ok++;
    console.log(`  ✓ ${slug}  ${(webp.length / 1024).toFixed(0)}KB  [${hit.license}]`);
  } catch (e) {
    console.log(`  ✖ ${slug}: ${e.message}`);
  }
}
await writeFile(join(OUT, "CREDITS.json"), JSON.stringify(credits, null, 2));
console.log(`\n✅ ${ok}/${Object.keys(QUERIES).length} blog cover images saved to ${OUT}\n`);
