"use client";

import { usePathname } from "next/navigation";
import { LazyMotion, domMax } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import type { MenuItem } from "@/lib/siteContent";
import type { FooterContent } from "@/lib/siteDefaults";

/** Route prefixes that render as full-screen app shells (own sidebar / chrome). */
const APP_PREFIXES = ["/dashboard", "/admin"];

/**
 * Wraps marketing pages with the public navbar, footer and scroll widgets.
 * App areas (user dashboard, admin panel) bring their own shell, so they
 * render bare — no marketing chrome.
 */
export function SiteChrome({
  children,
  headerMenu = [],
  footerContent,
  footerMenus,
}: {
  children: React.ReactNode;
  headerMenu?: MenuItem[];
  footerContent?: FooterContent;
  footerMenus?: { explore: MenuItem[]; company: MenuItem[]; bottom: MenuItem[] };
}) {
  const pathname = usePathname() ?? "";
  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isApp) {
    return (
      <div id="content" className="relative z-10 min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <LazyMotion features={domMax}>
      <ScrollProgress />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar items={headerMenu} />
        <main id="content" className="flex-1">
          {children}
        </main>
        <Footer content={footerContent} menus={footerMenus} />
      </div>
      <ScrollToTop />
    </LazyMotion>
  );
}
