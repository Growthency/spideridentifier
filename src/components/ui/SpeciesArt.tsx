import { SpiderMark } from "@/components/brand/Logo";
import { cn, round } from "@/lib/utils";

/**
 * Generated cover art for a species — a gradient mesh + web rings + the brand
 * spider mark. Pure SVG/CSS, so there are no raster images to ship.
 */
export function SpeciesArt({
  accent = "gold",
  className,
  markClassName,
}: {
  accent?: "gold" | "crimson";
  className?: string;
  markClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        accent === "crimson"
          ? "bg-[radial-gradient(120%_120%_at_20%_0%,rgba(13,148,136,0.32),transparent_55%),radial-gradient(120%_120%_at_100%_100%,rgba(16,185,129,0.18),transparent_60%)]"
          : "bg-[radial-gradient(120%_120%_at_20%_0%,rgba(16,185,129,0.32),transparent_55%),radial-gradient(120%_120%_at_100%_100%,rgba(13,148,136,0.16),transparent_60%)]",
        className
      )}
    >
      {/* concentric web rings */}
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        {[20, 40, 60, 80].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={round(100 + Math.cos(a) * 90)}
              y2={round(100 + Math.sin(a) * 90)}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <SpiderMark className={cn("h-20 w-20 drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]", markClassName)} />
      </div>
    </div>
  );
}
