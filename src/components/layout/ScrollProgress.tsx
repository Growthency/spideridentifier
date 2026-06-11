"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Fixed gradient bar at the very top that fills as the page is scrolled. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-brand-gradient shadow-[0_0_12px_rgba(16,185,129,0.7)]"
      aria-hidden="true"
    />
  );
}
