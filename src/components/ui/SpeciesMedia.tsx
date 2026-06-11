"use client";

import { useState } from "react";
import Image from "next/image";
import { SpeciesArt } from "@/components/ui/SpeciesArt";
import { cn } from "@/lib/utils";

/**
 * Shows the real (license-safe, WebP) species photo when one exists in
 * /public/images/species, layered over the generated SVG art. If the photo is
 * missing or fails to load, the SVG art shows through — no broken-image flash.
 * Served through next/image for responsive AVIF/WebP variants.
 */
export function SpeciesMedia({
  slug,
  accent = "gold",
  alt,
  className,
  markClassName,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: {
  slug: string;
  accent?: "gold" | "crimson";
  alt: string;
  className?: string;
  markClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [showPhoto, setShowPhoto] = useState(true);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <SpeciesArt accent={accent} className="absolute inset-0 h-full w-full" markClassName={markClassName} />
      {showPhoto && (
        <Image
          src={`/images/species/${slug}.webp`}
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
