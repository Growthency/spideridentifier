"use client";

import { useEffect, useRef } from "react";

/** Fixed gradient bar at the very top that fills as the page is scrolled. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transform: "scaleX(0)" }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-brand-gradient shadow-[0_0_12px_rgba(16,185,129,0.7)] transition-transform duration-150 ease-out"
      aria-hidden="true"
    />
  );
}
