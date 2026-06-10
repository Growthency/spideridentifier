import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, ScanSearch } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Markdown } from "@/components/blog/Markdown";
import { SpeciesArt } from "@/components/ui/SpeciesArt";
import { BlogCard } from "@/components/ui/BlogCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/fx/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBlogPost, getRelatedPosts } from "@/lib/data";
import { blogPosts } from "@/content/blog";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

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
  if (!post) return { title: "Article not found" };
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at,
      authors: [post.author_name],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug, 3);
  const accent = post.cover_accent === "crimson" ? "crimson" : "gold";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published_at,
          author: { "@type": "Person", name: post.author_name },
          publisher: { "@type": "Organization", name: siteConfig.name },
          mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
        }}
      />

      <PageHero eyebrow={post.category} title={post.title} subtitle={post.excerpt}>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/55">
          <span className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-ink-950">
              {post.author_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>
            {post.author_name} · {post.author_role}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {post.read_time} min read
          </span>
        </div>
      </PageHero>

      <article className="relative pb-12">
        <div className="container-px">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/55 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>

          {/* cover */}
          <div className="gradient-border mb-10 overflow-hidden rounded-4xl p-1.5">
            <SpeciesArt accent={accent} className="h-56 w-full rounded-[1.85rem] sm:h-72" markClassName="h-24 w-24" />
          </div>

          <div className="mx-auto max-w-3xl">
            <Markdown content={post.content} />

            {/* tags */}
            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-foreground/60">
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
          </div>

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
