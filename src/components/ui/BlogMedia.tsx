"use client";

import { useState } from "react";
import { SpeciesArt } from "@/components/ui/SpeciesArt";
import { cn } from "@/lib/utils";

/**
 * Blog cover: the real (license-safe, WebP) photo when present in
 * /public/images/blog, layered over the generated SVG art as a fallback.
 */
export function BlogMedia({
  slug,
  accent = "gold",
  alt,
  className,
}: {
  slug: string;
  accent?: "gold" | "crimson";
  alt: string;
  className?: string;
}) {
  const [showPhoto, setShowPhoto] = useState(true);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <SpeciesArt accent={accent} className="absolute inset-0 h-full w-full" />
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/blog/${slug}.webp`}
          alt={alt}
          loading="lazy"
          onError={() => setShowPhoto(false)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
        />
      )}
    </div>
  );
}
