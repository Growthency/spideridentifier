"use client";

import { cn } from "@/lib/utils";

/** Infinite horizontal marquee. Children are duplicated for a seamless loop. */
export function Marquee({
  children,
  className,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={cn("mask-fade-x group relative flex overflow-hidden", className)}>
      <div
        className="flex shrink-0 animate-marquee items-center gap-4 pr-4 group-hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className="flex shrink-0 animate-marquee items-center gap-4 pr-4 group-hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
