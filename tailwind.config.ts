import type { Config } from "tailwindcss";

/**
 * Brand system is logo-driven: a warm-obsidian canvas lit by a
 * Emerald (#10b981) → Teal (#0d9488) green gradient — fresh, nature/web
 * themed. Every accent, button and glow derives from these.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        ink: {
          950: "#08070A",
          900: "#0B0A0F",
          850: "#100E14",
          800: "#16131B",
          700: "#1E1A24",
          600: "#2A2530",
        },
        gold: {
          DEFAULT: "#10b981",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#6ee7b7",
          300: "#34d399",
          400: "#10b981",
          500: "#059669",
          600: "#047857",
        },
        crimson: {
          DEFAULT: "#0d9488",
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#0d9488",
          500: "#0d9488",
          600: "#0f766e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "sans-serif"],
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(16,185,129,0.45)",
        "glow-crimson": "0 0 60px -12px rgba(13,148,136,0.45)",
        card: "var(--shadow-card)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #10b981 0%, #22c55e 45%, #0d9488 100%)",
        "brand-radial": "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.18), transparent 60%)",
        "web-grid":
          "linear-gradient(to right, rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.06) 1px, transparent 1px)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translate(0px,0px)" },
          "50%": { transform: "translate(20px,-24px)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "dot-pulse": {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(0.6)" },
        },
        "scroll-bounce": {
          "0%,100%": { transform: "translateY(0)", opacity: "0.4" },
          "50%": { transform: "translateY(10px)", opacity: "1" },
        },
        "drift-a": {
          "0%,100%": { transform: "translate(0px,0px) scale(1)" },
          "33%": { transform: "translate(90px,60px) scale(1.12)" },
          "66%": { transform: "translate(-50px,100px) scale(0.92)" },
        },
        "drift-b": {
          "0%,100%": { transform: "translate(0px,0px) scale(1)" },
          "50%": { transform: "translate(-110px,-60px) scale(1.18)" },
        },
        "drift-c": {
          "0%,100%": { transform: "translate(0px,0px) scale(1)" },
          "40%": { transform: "translate(70px,-80px) scale(1.1)" },
          "75%": { transform: "translate(-60px,-30px) scale(0.95)" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 14s ease-in-out infinite",
        "spin-slow": "spin-slow 28s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
        marquee: "marquee 38s linear infinite",
        "dot-pulse": "dot-pulse 1.8s ease-in-out infinite",
        "scroll-bounce": "scroll-bounce 1.8s ease-in-out infinite",
        "drift-a": "drift-a 22s ease-in-out infinite",
        "drift-b": "drift-b 26s ease-in-out infinite",
        "drift-c": "drift-c 19s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
