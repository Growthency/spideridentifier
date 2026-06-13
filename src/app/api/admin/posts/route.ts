import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const postSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  category: z.string().default("Guide"),
  tags: z.array(z.string()).default([]),
  author_name: z.string().default("Marcus Webb"),
  author_role: z.string().default("Spider Researcher"),
  author_avatar: z.string().optional(),
  read_time: z.coerce.number().int().min(1).default(4),
  region: z.string().default("Worldwide"),
  level: z.string().min(1).default("Beginner"),
  cover_accent: z.string().min(1).default("gold"),
  status: z.enum(["draft", "published"]).default("draft"),
  is_featured: z.boolean().default(false),
  published_at: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  featured_image: z.string().optional(),
  access_type: z.enum(["free", "premium"]).default("free"),
  layout: z.enum(["full", "sidebar"]).default("sidebar"),
  custom_css: z.string().optional(),
  custom_schema: z.string().optional(),
});

async function guard() {
  if (!adminConfigured) return { error: "Storage is not configured", status: 503 };
  if (!(await isAdmin())) return { error: "Unauthorized", status: 401 };
  return null;
}

/** Map raw database errors to a clear one-time setup instruction. */
function friendlyDbError(message: string): string {
  return /schema cache|does not exist/i.test(message)
    ? "Database setup incomplete — run supabase/00-run-everything.sql in the Supabase SQL Editor once, then publish again."
    : message;
}

/** Bust the ISR cache so the change is live immediately, not in an hour. */
function revalidatePost(slug?: string | null, oldSlug?: string | null) {
  for (const path of ["/", "/blog", "/sitemap.xml", "/feed.xml"]) revalidatePath(path);
  if (slug) revalidatePath(`/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/${oldSlug}`);
}

export async function POST(req: Request) {
  const blocked = await guard();
  if (blocked) return NextResponse.json({ error: blocked.error }, { status: blocked.status });

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid post" }, { status: 400 });

  const data = parsed.data;
  const record = {
    ...data,
    slug: data.slug?.trim() || slugify(data.title),
    published_at: data.published_at || new Date().toISOString(),
  };

  const supabase = createAdminClient()!;
  const { data: inserted, error } = await supabase.from("blog_posts").insert(record).select().single();
  if (error) return NextResponse.json({ error: friendlyDbError(error.message) }, { status: 500 });
  revalidatePost(record.slug);
  return NextResponse.json({ ok: true, post: inserted });
}

export async function PUT(req: Request) {
  const blocked = await guard();
  if (blocked) return NextResponse.json({ error: blocked.error }, { status: blocked.status });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid post" }, { status: 400 });

  const data = parsed.data;
  const record = {
    ...data,
    slug: data.slug?.trim() || slugify(data.title),
    updated_at: new Date().toISOString(),
  };

  const supabase = createAdminClient()!;
  const { data: existing } = await supabase.from("blog_posts").select("slug").eq("id", body.id).maybeSingle();
  const { data: updated, error } = await supabase
    .from("blog_posts")
    .update(record)
    .eq("id", body.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: friendlyDbError(error.message) }, { status: 500 });
  revalidatePost(record.slug, existing?.slug);
  return NextResponse.json({ ok: true, post: updated });
}

export async function DELETE(req: Request) {
  const blocked = await guard();
  if (blocked) return NextResponse.json({ error: blocked.error }, { status: blocked.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createAdminClient()!;
  const { data: existing } = await supabase.from("blog_posts").select("slug").eq("id", id).maybeSingle();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: friendlyDbError(error.message) }, { status: 500 });
  revalidatePost(existing?.slug);
  return NextResponse.json({ ok: true });
}
