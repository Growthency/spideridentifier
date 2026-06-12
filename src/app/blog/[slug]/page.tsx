import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, ScanSearch } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Markdown } from "@/components/blog/Markdown";
import { SaveArticleButton } from "@/components/blog/SaveArticleButton";
import { Comments } from "@/components/blog/Comments";
import { ViewCounter } from "@/components/blog/ViewCounter";
import { PremiumGate } from "@/components/blog/PremiumGate";
import { BlogMedia } from "@/components/ui/BlogMedia";
import { BlogCard } from "@/components/ui/BlogCard";
import { blogPhotoCredits } from "@/content/blogPhotoCredits";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/fx/Reveal";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { getBlogPost, getRelatedPosts } from "@/lib/data";
import { getExternalLinkRules } from "@/lib/siteContent";
import { blogPosts } from "@/content/blog";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

// ISR — pre-rendered at build, refreshed hourly so admin-published posts
// appear without sacrificing static-page speed.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const url = `${siteConfig.url}/blog/${post.slug}`;
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;
  // Branded 1200×630 JPEG built from the post's cover photo — light enough
  // for WhatsApp/Telegram previews.
  const ogImage = `/og/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
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
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
  };
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
    url: `${siteConfig.url}/blog/${post.slug}`,
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    timeRequired: `PT${post.read_time}M`,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const [related, linkRules] = await Promise.all([getRelatedPosts(slug, 3), getExternalLinkRules()]);
  const accent = post.cover_accent === "crimson" ? "crimson" : "gold";
  const withSidebar = post.layout === "sidebar";

  const body = (
    <>
      <Markdown content={post.content} linkRules={linkRules} />

      {/* tags */}
      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-foreground/70">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* inline CTA */}
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

  return (
    <>
      {post.custom_css?.trim() && <style dangerouslySetInnerHTML={{ __html: post.custom_css }} />}
      <JsonLd data={articleSchema(post)} />
      <JsonLd data={breadcrumbSchema([{ name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }])} />

      <PageHero eyebrow={post.category} title={post.title} subtitle={post.excerpt}>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/55">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.author_avatar || "/images/authors/default-avatar.svg"}
              alt={post.author_name}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-foreground/10"
            />
            {post.author_name} · {post.author_role}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {post.read_time} min read
          </span>
          <ViewCounter slug={post.slug} />
        </div>
      </PageHero>

      <article className="relative pb-12">
        <div className="container-px">
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-foreground/55 transition-colors hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" /> All articles
            </Link>
            <SaveArticleButton slug={post.slug} />
          </div>

          {/* cover */}
          <div className="gradient-border mb-2 overflow-hidden rounded-4xl p-1.5">
            <BlogMedia
              slug={post.slug}
              src={post.featured_image || undefined}
              accent={accent}
              alt={post.title}
              className="h-56 w-full rounded-[1.85rem] sm:h-80"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
          {blogPhotoCredits[post.slug] && (
            <p className="mb-10 text-center text-[11px] text-foreground/70">
              Cover photo:{" "}
              <a href={blogPhotoCredits[post.slug].source} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                {blogPhotoCredits[post.slug].artist}
              </a>{" "}
              · {blogPhotoCredits[post.slug].license} · Wikimedia Commons
            </p>
          )}

          {withSidebar ? (
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_280px]">
              <div className="min-w-0">{post.access_type === "premium" ? <PremiumGate>{body}</PremiumGate> : body}</div>
              <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-3xl border border-foreground/8 bg-card/60 p-5">
                  <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-foreground/60">Recent guides</h3>
                  <ul className="space-y-3">
                    {related.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/blog/${p.slug}`} className="block text-sm font-medium leading-snug text-foreground/80 transition-colors hover:text-gold">
                          {p.title}
                        </Link>
                        <span className="text-[11px] text-foreground/40">{p.read_time} min read</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-crimson/10 p-5 text-center">
                  <p className="mb-3 font-display text-sm font-bold text-foreground">Identify a spider from a photo</p>
                  <Button href="/#identify" size="sm" className="w-full">
                    <ScanSearch className="h-4 w-4" /> Try it free
                  </Button>
                </div>
              </aside>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">{post.access_type === "premium" ? <PremiumGate>{body}</PremiumGate> : body}</div>
          )}

          {/* comments */}
          <Comments slug={post.slug} />

          {/* related */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 font-display text-2xl font-bold">Keep reading</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 3) * 0.07}>
                    <BlogCard post={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
