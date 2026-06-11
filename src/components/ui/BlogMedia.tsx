"use client";

import { useState } from "react";
import Image from "next/image";
import { SpeciesArt } from "@/components/ui/SpeciesArt";
import { cn } from "@/lib/utils";

/**
 * Blog cover: the real (license-safe, WebP) photo when present in
 * /public/images/blog, layered over the generated SVG art as a fallback.
 * Served through next/image for responsive AVIF/WebP variants.
 */
export function BlogMedia({
  slug,
  accent = "gold",
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: {
  slug: string;
  accent?: "gold" | "crimson";
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [showPhoto, setShowPhoto] = useState(true);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <SpeciesArt accent={accent} className="absolute inset-0 h-full w-full" />
      {showPhoto && (
        <Image
          src={`/images/blog/${slug}.webp`}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setShowPhoto(false)}
          className="object-cover transition-transform duration-700"
        />
      )}
    </div>
  );
}
