import { cn } from "@/lib/utils";

/**
 * SpiderMark — the brand spider icon.
 * Geometric body + eight articulated legs hung from a single silk thread,
 * filled with the Gold→Crimson brand gradient. Vector-only, crisp at any size.
 */
export function SpiderMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spiderGrad" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8BC50" />
          <stop offset="0.45" stopColor="#F5A524" />
          <stop offset="1" stopColor="#E23E57" />
        </linearGradient>
        <radialGradient id="spiderBody" cx="0.4" cy="0.3" r="0.9">
          <stop stopColor="#F8BC50" />
          <stop offset="0.6" stopColor="#F5A524" />
          <stop offset="1" stopColor="#E23E57" />
        </radialGradient>
      </defs>

      {/* silk thread */}
      <path d="M24 2 V11" stroke="url(#spiderGrad)" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />

      {/* legs — left */}
      <g
        stroke="url(#spiderGrad)"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M20 17 Q11 10 6.5 12" />
        <path d="M19.5 19.5 Q9 16.5 3.5 19" />
        <path d="M19.5 22.5 Q9.5 25 4.5 30.5" />
        <path d="M20.5 25 Q12.5 31 8.5 38" />
        {/* legs — right */}
        <path d="M28 17 Q37 10 41.5 12" />
        <path d="M28.5 19.5 Q39 16.5 44.5 19" />
        <path d="M28.5 22.5 Q38.5 25 43.5 30.5" />
        <path d="M27.5 25 Q35.5 31 39.5 38" />
      </g>

      {/* body */}
      <ellipse cx="24" cy="30" rx="7" ry="9" fill="url(#spiderBody)" />
      <ellipse cx="24" cy="18.4" rx="4.6" ry="5.1" fill="url(#spiderBody)" />
      {/* pedipalps */}
      <path d="M22 14.5 Q20.5 12 21.5 10.5" stroke="url(#spiderGrad)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 14.5 Q27.5 12 26.5 10.5" stroke="url(#spiderGrad)" strokeWidth="1.8" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="22.4" cy="17.6" r="0.95" fill="#0B0A0F" />
      <circle cx="25.6" cy="17.6" r="0.95" fill="#0B0A0F" />
      {/* abdomen marking */}
      <path d="M24 24 L24 35" stroke="#0B0A0F" strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/** Full lockup: spider mark + wordmark. */
export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SpiderMark className={markClassName} />
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight leading-none">
          <span className="text-foreground">Spider</span>
          <span className="text-gradient-animate">Identifier</span>
        </span>
      )}
    </span>
  );
}
