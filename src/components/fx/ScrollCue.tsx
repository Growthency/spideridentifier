"use client";

/** Bouncing "Scroll" hint at the bottom of the hero. Click to scroll down. */
export function ScrollCue({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.scrollBy({ top: Math.round(window.innerHeight * 0.85), behavior: "smooth" })}
      aria-label="Scroll down"
      className={`group mx-auto flex flex-col items-center gap-2.5 text-foreground/70 transition-colors hover:text-gold ${className ?? ""}`}
    >
      <span className="h-10 w-px animate-scroll-bounce bg-gradient-to-b from-transparent via-gold to-crimson" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em]">Scroll</span>
    </button>
  );
}
