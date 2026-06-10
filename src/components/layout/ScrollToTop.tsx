"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useState } from "react";

/**
 * Circular "back to top" control with a live progress ring AND a numeric
 * percentage, so visitors can see exactly how far down the page they are.
 */
export function ScrollToTop() {
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [show, setShow] = useState(false);
  const [percent, setPercent] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setShow(v > 0.05);
    setPercent(Math.round(v * 100));
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={`Scroll back to top — ${percent}% scrolled`}
          className="group fixed bottom-6 right-5 z-[65] grid h-14 w-14 place-items-center rounded-full glass-card text-foreground shadow-card transition-transform hover:scale-105 sm:bottom-8 sm:right-8"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="25" className="fill-none stroke-foreground/10" strokeWidth="3" />
            <motion.circle
              cx="28"
              cy="28"
              r="25"
              className="fill-none"
              stroke="url(#stt-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient id="stt-grad" x1="0" y1="0" x2="56" y2="56">
                <stop stopColor="#F5A524" />
                <stop offset="1" stopColor="#E23E57" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-[11px] font-semibold tabular-nums text-foreground/80 transition-opacity duration-200 group-hover:opacity-0">
            {percent}%
          </span>
          <ArrowUp className="absolute h-5 w-5 text-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
