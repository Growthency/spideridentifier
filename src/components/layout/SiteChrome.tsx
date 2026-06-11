"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

/** Route prefixes that render as full-screen app shells (own sidebar / chrome). */
const APP_PREFIXES = ["/dashboard", "/admin"];

/**
 * Wraps marketing pages with the public navbar, footer and scroll widgets.
 * App areas (user dashboard, admin panel) bring their own shell, so they
 * render bare — no marketing chrome.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isApp) {
    return <div className="relative z-10 min-h-screen">{children}</div>;
  }

  return (
    <>
      <ScrollProgress />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <ScrollToTop />
    </>
  );
}
