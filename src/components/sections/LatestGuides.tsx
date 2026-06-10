import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { BlogCard } from "@/components/ui/BlogCard";
import { getBlogPosts } from "@/lib/data";

export async function LatestGuides() {
  const posts = await getBlogPosts();
  if (!posts.length) return null;
  const [featured, ...rest] = posts;

  return (
    <section className="relative py-24">
      <div className="container-px">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            align="left"
            eyebrow="From the blog"
            title={<>Spider guides &amp; <span className="text-gradient">field notes</span></>}
            subtitle="Expert-written identification guides, species spotlights and safety advice."
            className="md:max-w-2xl"
          />
          <Button href="/blog" variant="outline" className="shrink-0">
            All articles <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-14 grid gap-5">
          <Reveal>
            <BlogCard post={featured} featured />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.07}>
                <BlogCard post={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
