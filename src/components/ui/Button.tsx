import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-ink-950 shadow-[0_10px_30px_-10px_rgba(245,165,36,0.6)] hover:shadow-[0_14px_40px_-8px_rgba(226,62,87,0.6)] hover:-translate-y-0.5",
  secondary: "glass-card text-foreground hover:border-foreground/20 hover:-translate-y-0.5",
  outline:
    "border border-gold/40 text-foreground hover:border-gold hover:bg-gold/10 hover:-translate-y-0.5",
  ghost: "text-foreground/80 hover:text-foreground hover:bg-foreground/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: Variant;
  size?: Size;
}

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href) {
    const external = href.startsWith("http");
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
