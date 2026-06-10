import { cn, round } from "@/lib/utils";

export type SpiderPart = "body" | "legs" | "patterns" | "eyes" | "web";

/**
 * Stylised, annotatable spider illustration. The `active` part is lit with the
 * brand gradient + glow while the rest dims — used by the "what the AI looks
 * at" section. Vector-only.
 */
export function AnatomySpider({ active, className }: { active: SpiderPart; className?: string }) {
  const on = (p: SpiderPart) => active === p;
  const dim = (p: SpiderPart) => (on(p) ? "opacity-100" : "opacity-30");

  return (
    <svg viewBox="0 0 400 400" className={cn("h-full w-full", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="anat-grad" x1="120" y1="80" x2="300" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8BC50" />
          <stop offset="0.5" stopColor="#F5A524" />
          <stop offset="1" stopColor="#E23E57" />
        </linearGradient>
        <radialGradient id="anat-body" cx="0.4" cy="0.3" r="0.9">
          <stop stopColor="#F8BC50" />
          <stop offset="0.6" stopColor="#F5A524" />
          <stop offset="1" stopColor="#E23E57" />
        </radialGradient>
        <filter id="anat-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* WEB */}
      <g className={cn("transition-opacity duration-500", dim("web"))} stroke="url(#anat-grad)">
        {[60, 110, 160].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} strokeWidth="1" opacity="0.5" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1="200"
              y1="200"
              x2={round(200 + Math.cos(a) * 180)}
              y2={round(200 + Math.sin(a) * 180)}
              strokeWidth="0.8"
              opacity="0.4"
            />
          );
        })}
      </g>

      {/* LEGS */}
      <g
        className={cn("transition-opacity duration-500", dim("legs"))}
        stroke="url(#anat-grad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={on("legs") ? "url(#anat-glow)" : undefined}
      >
        <path d="M168 168 Q110 120 70 132" />
        <path d="M164 186 Q96 168 58 188" />
        <path d="M164 210 Q98 226 66 268" />
        <path d="M170 230 Q120 272 92 320" />
        <path d="M232 168 Q290 120 330 132" />
        <path d="M236 186 Q304 168 342 188" />
        <path d="M236 210 Q302 226 334 268" />
        <path d="M230 230 Q280 272 308 320" />
      </g>

      {/* BODY */}
      <g className={cn("transition-opacity duration-500", dim("body"))} filter={on("body") ? "url(#anat-glow)" : undefined}>
        <ellipse cx="200" cy="240" rx="52" ry="66" fill="url(#anat-body)" />
        <ellipse cx="200" cy="166" rx="34" ry="38" fill="url(#anat-body)" />
      </g>

      {/* PATTERNS — abdomen marking */}
      <g className={cn("transition-opacity duration-500", dim("patterns"))} filter={on("patterns") ? "url(#anat-glow)" : undefined}>
        <path
          d="M200 196 L200 296 M200 220 L176 238 M200 220 L224 238 M200 252 L172 268 M200 252 L228 268"
          stroke="#0B0A0F"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.65"
        />
        <circle cx="200" cy="240" r="10" fill="#0B0A0F" opacity="0.5" />
      </g>

      {/* EYES */}
      <g className={cn("transition-opacity duration-500", dim("eyes"))} filter={on("eyes") ? "url(#anat-glow)" : undefined}>
        {[
          [186, 150],
          [214, 150],
          [180, 162],
          [220, 162],
          [192, 158],
          [208, 158],
          [196, 168],
          [204, 168],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={on("eyes") ? 5 : 3.4} fill="#0B0A0F" />
        ))}
        {on("eyes") && (
          <>
            <circle cx="186" cy="150" r="2" fill="#F8BC50" />
            <circle cx="214" cy="150" r="2" fill="#F8BC50" />
          </>
        )}
      </g>
    </svg>
  );
}
