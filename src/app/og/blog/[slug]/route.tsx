import { getBlogPost } from "@/lib/data";
import { siteConfig } from "@/lib/site";
import { composeOgJpeg, loadPhoto, loadPhotoFromUrl, ogResponse, OgFrame, OgChip } from "@/lib/og";

/**
 * Social-share card for blog posts — cover photo + title + brand, served as
 * a lightweight JPEG so every platform (WhatsApp included) renders the
 * preview instantly.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  // Admin featured image wins; bundled slug photo is the fallback.
  const photo = (post?.featured_image ? await loadPhotoFromUrl(post.featured_image) : null) ?? (await loadPhoto("blog", slug));
  const title = post?.title ?? "Spider identification guide";
  const category = post?.category ?? "Guide";
  const host = new URL(siteConfig.url).hostname;

  const jpeg = await composeOgJpeg(
    photo,
    <OgFrame withPhoto={Boolean(photo)} host={host}>
      <div style={{ display: "flex" }}>
        <OgChip>{category}</OgChip>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 22,
          fontSize: title.length > 58 ? 52 : 62,
          fontWeight: 800,
          color: "#F8FAF9",
          lineHeight: 1.12,
          letterSpacing: -1,
          maxWidth: 1040,
        }}
      >
        {title}
      </div>
    </OgFrame>
  );

  return ogResponse(jpeg);
}
