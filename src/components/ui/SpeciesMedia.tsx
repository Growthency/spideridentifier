"use client";

import { useState } from "react";
import { SpeciesArt } from "@/components/ui/SpeciesArt";
import { cn } from "@/lib/utils";

/**
 * Shows the real (license-safe, WebP) species photo when one exists in
 * /public/images/species, layered over the generated SVG art. If the photo is
 * missing or fails to load, the SVG art shows through — no broken-image flash.
 */
export function SpeciesMedia({
  slug,
  accent = "gold",
  alt,
  className,
  markClassName,
}: {
  slug: string;
  accent?: "gold" | "crimson";
  alt: string;
  className?: string;
  markClassName?: string;
}) {
  const [showPhoto, setShowPhoto] = useState(true);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <SpeciesArt accent={accent} className="absolute inset-0 h-full w-full" markClassName={markClassName} />
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/species/${slug}.webp`}
          alt={alt}
          loading="lazy"
          onError={() => setShowPhoto(false)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
        />
      )}
    </div>
  );
}
