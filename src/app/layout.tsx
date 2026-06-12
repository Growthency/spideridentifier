import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Analytics } from "@/components/seo/Analytics";
import { RawScripts } from "@/components/seo/RawScripts";
import { getSiteChromeData } from "@/lib/siteContent";
import { themeOverrideCss } from "@/lib/siteDefaults";
import { BackdropGlobs } from "@/components/fx/BackdropGlobs";
import { WebParticles } from "@/components/fx/WebParticles";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// Both are variable fonts — a single self-hosted woff2 per family covers
// every weight (no per-weight downloads, zero layout shift).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  // Search Console ownership proofs — public by design. First token verifies
  // the owner's Google account, second verifies the analytics service account
  // (lets it call the URL-inspection / Indexing APIs without UI access).
  verification: {
    google: [
      process.env.GOOGLE_SITE_VERIFICATION || "2WI2zdSsYSCEP0bS5a9VB3TrIfadrnlljH7yDR54yH4",
      "6zQVpl15SESJaQIxvh9bT9tN5XUHMxZMP7p4KqNiCm0",
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F4" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0A0F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Admin-managed chrome (scripts, theme, custom CSS, menus, footer copy) —
  // all fall back to the built-in defaults when nothing is configured.
  const chrome = await getSiteChromeData();
  const themeCss = themeOverrideCss(chrome.theme);

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="grain relative min-h-screen bg-background font-sans text-foreground antialiased">
        {themeCss && <style id="admin-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />}
        {chrome.customCss && <style id="admin-custom-css" dangerouslySetInnerHTML={{ __html: chrome.customCss }} />}
        {chrome.scripts.length > 0 && <RawScripts scripts={chrome.scripts} />}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <BackdropGlobs />
          <WebParticles />
          <SiteChrome
            headerMenu={chrome.headerMenu}
            footerContent={chrome.footer}
            footerMenus={{
              explore: chrome.footerExplore,
              company: chrome.footerCompany,
              bottom: chrome.footerBottom,
            }}
          >
            {children}
          </SiteChrome>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
