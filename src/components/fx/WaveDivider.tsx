import { cn } from "@/lib/utils";

/** A slim, curvy gradient separator — the "akabaka" line between sections. */
export function WaveDivider({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div className={cn("relative h-16 w-full overflow-hidden", flip && "rotate-180", className)} aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <path
          d="M0 40 C 240 0, 480 80, 720 40 S 1200 0, 1440 40"
          stroke="url(#wave-grad)"
          strokeWidth="2"
          opacity="0.5"
        />
        <path
          d="M0 52 C 240 12, 480 92, 720 52 S 1200 12, 1440 52"
          stroke="url(#wave-grad)"
          strokeWidth="1"
          opacity="0.22"
        />
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" stopOpacity="0" />
            <stop offset="0.5" stopColor="#10b981" />
            <stop offset="1" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
