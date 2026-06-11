"use client";

import { useEffect, useRef } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const hiddenClass: Record<Direction, string> = {
  up: "reveal-from-up",
  down: "reveal-from-down",
  left: "reveal-from-left",
  right: "reveal-from-right",
  none: "",
};

/**
 * Scroll-triggered reveal — fades + slides children in once on enter.
 * Plain IntersectionObserver + CSS (no animation library), and fold-safe:
 * the server HTML is always visible, and anything already on screen at
 * hydration is left untouched, so the LCP element is never hidden behind JS.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already (partly) on screen → leave it painted, no entrance.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60 && rect.bottom > 0) return;

    el.classList.add("reveal");
    const dir = hiddenClass[direction];
    if (dir) el.classList.add(dir);
    if (delay) el.style.transitionDelay = `${delay}s`;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-in");
          if (once) io.disconnect();
        } else if (!once) {
          el.classList.remove("reveal-in");
        }
      },
      { rootMargin: "-80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, direction, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
