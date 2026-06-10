/**
 * Seed Supabase with the bundled species + blog content.
 *
 * Usage:
 *   npm run seed
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (loaded via Node's --env-file). Content is imported directly from the
 * TypeScript source files (type-stripped at runtime) so there is no duplicate
 * copy to keep in sync.
 */
import { createClient } from "@supabase/supabase-js";
import { speciesLibrary } from "../src/content/species.ts";
import { blogPosts } from "../src/content/blog.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("\n✖ Missing env vars. Make sure NEXT_PUBLIC_SUPABASE_URL and");
  console.error("  SUPABASE_SERVICE_ROLE_KEY are set in .env.local.\n");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("\n🕷️  Seeding Spider Identifier database…\n");

  // Species
  const speciesRows = speciesLibrary.map((s) => ({
    slug: s.slug,
    common_name: s.common_name,
    scientific_name: s.scientific_name,
    family: s.family,
    venom_level: s.venom_level,
    size: s.size,
    region: s.region,
    habitat: s.habitat,
    summary: s.summary,
    identification: s.identification,
    fact: s.fact,
    accent: s.accent,
    is_dangerous: s.is_dangerous ?? false,
  }));
  const { error: spErr } = await supabase.from("species").upsert(speciesRows, { onConflict: "slug" });
  if (spErr) throw spErr;
  console.log(`   ✓ ${speciesRows.length} species`);

  // Blog posts
  const postRows = blogPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    tags: p.tags,
    author_name: p.author_name,
    author_role: p.author_role,
    read_time: p.read_time,
    region: p.region,
    level: p.level,
    cover_accent: p.cover_accent,
    status: p.status,
    is_featured: p.is_featured,
    published_at: p.published_at,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
  }));
  const { error: bpErr } = await supabase.from("blog_posts").upsert(postRows, { onConflict: "slug" });
  if (bpErr) throw bpErr;
  console.log(`   ✓ ${postRows.length} blog posts`);

  console.log("\n✅ Done. Your database is seeded.\n");
}

run().catch((err) => {
  console.error("\n✖ Seed failed:", err.message, "\n");
  process.exit(1);
});
