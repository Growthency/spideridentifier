"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Fixed living backdrop: blurred gold/crimson "globs" that BOTH drift
 * continuously (CSS, so the background feels alive even when still) AND shift
 * with scroll (Framer parallax on an outer wrapper, so the two transforms
 * never fight). Plus a faint web grid and vignette.
 */
export function BackdropGlobs() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -280]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -180]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(16,185,129,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(100%_60%_at_100%_100%,rgba(13,148,136,0.08),transparent_60%)]" />

      {/* drifting globs — outer = scroll parallax, inner = continuous drift */}
      <motion.div style={{ y: y1 }} className="absolute -left-32 top-[4%]">
        <div className="h-[36rem] w-[36rem] rounded-full bg-gold/20 blur-[120px] animate-drift-a" />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute -right-40 top-[34%]">
        <div className="h-[42rem] w-[42rem] rounded-full bg-crimson/20 blur-[140px] animate-drift-b" />
      </motion.div>
      <motion.div style={{ y: y3 }} className="absolute left-[18%] top-[68%]">
        <div className="h-[32rem] w-[32rem] rounded-full bg-gold/12 blur-[120px] animate-drift-c" />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-[12%] top-[8%]">
        <div className="h-[24rem] w-[24rem] rounded-full bg-crimson/12 blur-[110px] animate-drift-c" />
      </motion.div>

      {/* faint web grid */}
      <div className="absolute inset-0 bg-web-grid bg-[size:62px_62px] opacity-50 [mask-image:radial-gradient(80%_60%_at_50%_30%,#000,transparent)]" />
    </div>
  );
}
