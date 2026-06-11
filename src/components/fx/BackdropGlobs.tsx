"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed living backdrop: blurred green "globs" that BOTH drift continuously
 * (CSS, so the background feels alive even when still) AND shift with scroll
 * (a tiny rAF-throttled parallax on the outer wrappers, so the two transforms
 * never fight). Plus a faint web grid and vignette.
 */
export function BackdropGlobs() {
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);
  const refC = useRef<HTMLDivElement>(null);
  const refD = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (refA.current) refA.current.style.transform = `translateY(${p * -280}px)`;
      if (refB.current) refB.current.style.transform = `translateY(${p * 240}px)`;
      if (refC.current) refC.current.style.transform = `translateY(${p * -180}px)`;
      if (refD.current) refD.current.style.transform = `translateY(${p * 240}px)`;
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
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(16,185,129,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(100%_60%_at_100%_100%,rgba(13,148,136,0.08),transparent_60%)]" />

      {/* drifting globs — outer = scroll parallax, inner = continuous drift.
          Smaller and softer on phones: giant 100px+ blurs are expensive to
          rasterize on mobile GPUs and slow the first paint. */}
      <div ref={refA} className="absolute -left-32 top-[4%]">
        <div className="h-[20rem] w-[20rem] rounded-full bg-gold/20 blur-[70px] animate-drift-a sm:h-[36rem] sm:w-[36rem] sm:blur-[120px]" />
      </div>
      <div ref={refB} className="absolute -right-40 top-[34%]">
        <div className="h-[24rem] w-[24rem] rounded-full bg-crimson/20 blur-[80px] animate-drift-b sm:h-[42rem] sm:w-[42rem] sm:blur-[140px]" />
      </div>
      <div ref={refC} className="absolute left-[18%] top-[68%] hidden sm:block">
        <div className="h-[32rem] w-[32rem] rounded-full bg-gold/12 blur-[120px] animate-drift-c" />
      </div>
      <div ref={refD} className="absolute right-[12%] top-[8%] hidden sm:block">
        <div className="h-[24rem] w-[24rem] rounded-full bg-crimson/12 blur-[110px] animate-drift-c" />
      </div>

      {/* faint web grid */}
      <div className="absolute inset-0 bg-web-grid bg-[size:62px_62px] opacity-50 [mask-image:radial-gradient(80%_60%_at_50%_30%,#000,transparent)]" />
    </div>
  );
}
