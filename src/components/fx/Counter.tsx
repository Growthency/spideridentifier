"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** Split "50,000+", "< 3s", "98%" into prefix / number / suffix. */
function parse(value: string) {
  const m = value.match(/^(\D*)([\d.,]+)(.*)$/);
  if (!m) return { prefix: "", target: 0, suffix: value, hasComma: false, decimals: 0 };
  const [, prefix, numStr, suffix] = m;
  const clean = numStr.replace(/,/g, "");
  return {
    prefix,
    suffix,
    target: parseFloat(clean) || 0,
    hasComma: numStr.includes(","),
    decimals: clean.includes(".") ? clean.split(".")[1].length : 0,
  };
}

function fmt(n: number, hasComma: boolean, decimals: number) {
  if (decimals > 0) return n.toFixed(decimals);
  const rounded = Math.round(n);
  return hasComma ? rounded.toLocaleString("en-US") : String(rounded);
}

/**
 * Counts up to the target once when scrolled into view, then settles exactly.
 * Parsing is memoised and effect deps are stable, so the animation runs a
 * single time (no restart loop).
 */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const { prefix, target, suffix, hasComma, decimals } = useMemo(() => parse(value), [value]);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "-40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    let start = 0;
    const duration = 1500;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
      else setN(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {fmt(n, hasComma, decimals)}
      {suffix}
    </span>
  );
}
