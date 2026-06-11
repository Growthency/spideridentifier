import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

/** Absolute URL for a path ("/" → site root, no trailing slash). */
export function absoluteUrl(path: string) {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}

/**
 * Consistent per-page metadata: unique title/description, self-referencing
 * canonical, full Open Graph + Twitter card. og:image is injected
 * automatically by the nearest opengraph-image.tsx file convention, so
 * Facebook, WhatsApp, LinkedIn, X and Telegram always get a 1200×630 preview.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = `${title} · ${siteConfig.name}`;

  const meta: Metadata = {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: "en_US",
      url,
      title: ogTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
  if (noIndex) meta.robots = { index: false, follow: true };
  return meta;
}
