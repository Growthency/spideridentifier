"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

const RADIUS = 25;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular "back to top" control with a live progress ring AND a numeric
 * percentage, so visitors can see exactly how far down the page they are.
 */
export function ScrollToTop() {
  const [show, setShow] = useState(false);
  const [percent, setPercent] = useState(0);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const v = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setShow(v > 0.05);
      setPercent(Math.round(v * 100));
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - v));
      }
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
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={`Scroll back to top — ${percent}% scrolled`}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`group fixed bottom-6 right-5 z-[65] grid h-14 w-14 place-items-center rounded-full glass-card text-foreground shadow-card transition-all duration-300 hover:scale-105 sm:bottom-8 sm:right-8 ${
        show ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-5 scale-75 opacity-0"
      }`}
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={RADIUS} className="fill-none stroke-foreground/10" strokeWidth="3" />
        <circle
          ref={ringRef}
          cx="28"
          cy="28"
          r={RADIUS}
          className="fill-none transition-[stroke-dashoffset] duration-150 ease-out"
          stroke="url(#stt-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
        <defs>
          <linearGradient id="stt-grad" x1="0" y1="0" x2="56" y2="56">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[11px] font-semibold tabular-nums text-foreground/80 transition-opacity duration-200 group-hover:opacity-0">
        {percent}%
      </span>
      <ArrowUp className="absolute h-5 w-5 text-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </button>
  );
}
