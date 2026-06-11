import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { getBlogPosts } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Spider Identification Blog — Guides, Species & Safety",
  description:
    "Expert spider identification guides, species spotlights, photography tips and bite-safety advice — crafted to help you identify spiders smarter and safer.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHero
        eyebrow="The blog"
        title={<>Spider guides &amp; <span className="text-gradient">field notes</span></>}
        subtitle="Expert identification guides, species spotlights and safety tips — written to help you recognise any spider with confidence."
      />
      <section className="relative pb-12">
        <div className="container-px">
          <BlogExplorer posts={posts} />
        </div>
      </section>
    </>
  );
}
