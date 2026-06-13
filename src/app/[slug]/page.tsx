import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Calendar, Clock, ScanSearch, ChevronRight } from "lucide-react";
import { Markdown } from "@/components/blog/Markdown";
import { BlogMedia } from "@/components/ui/BlogMedia";
import { BlogCard } from "@/components/ui/BlogCard";
import { blogPhotoCredits } from "@/content/blogPhotoCredits";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/fx/Reveal";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { SaveArticleButton } from "@/components/blog/SaveArticleButton";
import { Comments } from "@/components/blog/Comments";
import { ViewCounter } from "@/components/blog/ViewCounter";
import { PremiumGate } from "@/components/blog/PremiumGate";
import { PostSidebar } from "@/components/blog/PostSidebar";
import { TableOfContents, type TocItem } from "@/components/blog/TableOfContents";
import { getBlogPost, getBlogPosts, getRelatedPosts, getSpeciesBySlugData } from "@/lib/data";
import { getExternalLinkRules } from "@/lib/siteContent";
import { blogPosts } from "@/content/blog";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

// Articles live at the site root (spideridentifier.online/<slug>) — static
// with hourly refresh so admin-published posts appear quickly.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Not found", robots: { index: false } };
  const url = `${siteConfig.url}/${post.slug}`;
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;
  const ogImage = `/og/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: `/${post.slug}`,
      types: { "application/rss+xml": [{ url: "/feed.xml", title: `${siteConfig.name} — Articles` }] },
    },
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: "en_US",
      url,
      title: post.title,
      description,
      publishedTime: post.published_at,
      authors: [post.author_name],
      section: post.category,
      tags: post.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: [ogImage] },
  };
}

/** Anchor ids matching the body renderers (simple slugger). */
const anchor = (t: string) =>
  t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

function extractToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  if (/<\/?(p|h[1-6]|ul|ol|div|img|table|blockquote|figure)\b/i.test(content.slice(0, 1000))) {
    for (const m of content.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)) {
      const text = (m[2] ?? "").replace(/<[^>]+>/g, "").trim();
      if (text) items.push({ id: anchor(text), text, level: Number(m[1]) === 3 ? 3 : 2 });
    }
  } else {
    for (const m of content.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
      const text = (m[2] ?? "").replace(/[*_`]/g, "").trim();
      if (text) items.push({ id: anchor(text), text, level: m[1]?.length === 3 ? 3 : 2 });
    }
  }
  return items;
}

/** Page-specific JSON-LD: the admin's custom schema replaces the default. */
function articleSchema(post: NonNullable<Awaited<ReturnType<typeof getBlogPost>>>): object {
  if (post.custom_schema?.trim()) {
    try {
      return JSON.parse(post.custom_schema);
    } catch {
      // invalid JSON in the editor — fall back to the default Article schema
    }
  }
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${siteConfig.url}/og/blog/${post.slug}`,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { "@type": "Person", name: post.author_name, jobTitle: post.author_role },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/icon.svg` },
    },
    url: `${siteConfig.url}/${post.slug}`,
    mainEntityOfPage: `${siteConfig.url}/${post.slug}`,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    timeRequired: `PT${post.read_time}M`,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/i.test(slug)) notFound();

  const post = await getBlogPost(slug);
  if (!post) {
    // species short links still resolve from the root
    const species = await getSpeciesBySlugData(slug);
    if (species) permanentRedirect(`/species/${species.slug}`);
    notFound();
  }

  const [related, linkRules, allPosts] = await Promise.all([
    getRelatedPosts(slug, 3),
    getExternalLinkRules(),
    getBlogPosts(),
  ]);
  const accent = post.cover_accent === "crimson" ? "crimson" : "gold";
  const withSidebar = post.layout !== "full";
  const toc = extractToc(post.content);
  const credit = blogPhotoCredits[post.slug];

  const body = (
    <>
      <Markdown content={post.content} linkRules={linkRules} />

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-foreground/70">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-crimson/10 p-8 text-center">
        <h3 className="font-display text-xl font-bold">Found a spider like this?</h3>
        <p className="max-w-md text-sm text-foreground/65">
          Upload a photo and confirm the species in seconds — with a venom-risk indicator.
        </p>
        <Button href="/#identify" size="lg">
          <ScanSearch className="h-5 w-5" /> Identify a Spider Free
        </Button>
      </div>
    </>
  );

  const main = (
    <div className="min-w-0">
      {/* category + title */}
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold-soft))]">
        {post.category}
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
        {post.title}
      </h1>

      {/* author card */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/15 bg-gold/[0.05] px-5 py-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.author_avatar || "/images/authors/default-author.webp"}
            alt={post.author_name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/30"
          />
          <div>
            <p className="text-sm font-bold text-foreground">{post.author_name}</p>
            <p className="text-xs text-foreground/55">{post.author_role}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-foreground/55">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Updated {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {post.read_time} min read
          </span>
          <SaveArticleButton slug={post.slug} />
        </div>
      </div>

      <div className="mt-3">
        <ViewCounter slug={post.slug} />
      </div>

      {/* cover */}
      <div className="gradient-border mb-2 mt-6 overflow-hidden rounded-4xl p-1.5">
        <BlogMedia
          slug={post.slug}
          src={post.featured_image || undefined}
          accent={accent}
          alt={post.title}
          className="h-56 w-full rounded-[1.85rem] sm:h-80"
          sizes="(max-width: 1024px) 100vw, 760px"
          priority
        />
      </div>
      {credit && (
        <p className="mb-8 text-center text-[11px] text-foreground/70">
          Cover photo:{" "}
          <a href={credit.source} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
            {credit.artist}
          </a>{" "}
          · {credit.license} · Wikimedia Commons
        </p>
      )}

      {/* table of contents */}
      <TableOfContents items={toc} />

      {post.access_type === "premium" ? <PremiumGate>{body}</PremiumGate> : body}

      {/* comments */}
      <Comments slug={post.slug} />

      {/* related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">Keep reading</h2>
          <div className={`grid gap-5 sm:grid-cols-2 ${withSidebar ? "" : "lg:grid-cols-3"}`}>
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.07}>
                <BlogCard post={p} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {post.custom_css?.trim() && <style dangerouslySetInnerHTML={{ __html: post.custom_css }} />}
      <JsonLd data={articleSchema(post)} />
      <JsonLd data={breadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: post.title, path: `/${post.slug}` }])} />

      <article className="relative pb-16 pt-28 sm:pt-32">
        <div className="container-px">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-foreground/50">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-gold">
              Blog
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="max-w-[60vw] truncate text-foreground/75">{post.title}</span>
          </nav>

          {withSidebar ? (
            <div className="grid gap-10 lg:grid-cols-[1fr_330px]">
              {main}
              <PostSidebar current={post} posts={allPosts} />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">{main}</div>
          )}
        </div>
      </article>
    </>
  );
}
