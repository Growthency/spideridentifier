import { createPublicClient, publicConfigured } from "@/lib/supabase/public";
import {
  DEFAULT_FOOTER,
  DEFAULT_THEME,
  type FooterContent,
  type ThemeColors,
} from "@/lib/siteDefaults";

/**
 * Read admin-managed site configuration with graceful fallbacks — the public
 * site renders fine before the admin schema is installed or any key is set.
 */

export async function getSiteContent<T>(key: string, fallback: T): Promise<T> {
  if (!publicConfigured) return fallback;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase!.from("site_content").select("value").eq("key", key).maybeSingle();
    if (error || !data) return fallback;
    return (data.value as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export interface SiteScript {
  id: string;
  label: string;
  location: "head" | "body";
  code: string;
  enabled: boolean;
  sort_order: number;
}

export async function getSiteScripts(): Promise<SiteScript[]> {
  if (!publicConfigured) return [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase!
      .from("site_scripts")
      .select("*")
      .eq("enabled", true)
      .order("sort_order", { ascending: true });
    return (data as SiteScript[]) ?? [];
  } catch {
    return [];
  }
}

export interface MenuItem {
  id: string;
  menu: "header" | "footer_explore" | "footer_company" | "footer_bottom";
  label: string;
  url: string;
  target: "_self" | "_blank";
  sort_order: number;
  enabled: boolean;
}

export async function getMenu(menu: MenuItem["menu"]): Promise<MenuItem[]> {
  if (!publicConfigured) return [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase!
      .from("menu_items")
      .select("*")
      .eq("menu", menu)
      .eq("enabled", true)
      .order("sort_order", { ascending: true });
    return (data as MenuItem[]) ?? [];
  } catch {
    return [];
  }
}

export interface ExternalLinkRule {
  id: string;
  domain: string;
  nofollow: boolean;
  sponsored: boolean;
}

export async function getExternalLinkRules(): Promise<ExternalLinkRule[]> {
  if (!publicConfigured) return [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase!.from("external_link_rules").select("*");
    return (data as ExternalLinkRule[]) ?? [];
  } catch {
    return [];
  }
}

export interface SiteChromeData {
  scripts: SiteScript[];
  customCss: string;
  theme: ThemeColors;
  footer: FooterContent;
  headerMenu: MenuItem[];
  footerExplore: MenuItem[];
  footerCompany: MenuItem[];
  footerBottom: MenuItem[];
}

/** Everything the public layout needs from the admin, in one parallel fetch. */
export async function getSiteChromeData(): Promise<SiteChromeData> {
  const [scripts, customCss, theme, footer, headerMenu, footerExplore, footerCompany, footerBottom] =
    await Promise.all([
      getSiteScripts(),
      getSiteContent<string>("custom_css", ""),
      getSiteContent<ThemeColors>("theme", DEFAULT_THEME),
      getSiteContent<FooterContent>("footer", DEFAULT_FOOTER),
      getMenu("header"),
      getMenu("footer_explore"),
      getMenu("footer_company"),
      getMenu("footer_bottom"),
    ]);
  return {
    scripts,
    customCss,
    theme: { ...DEFAULT_THEME, ...theme },
    footer: { ...DEFAULT_FOOTER, ...footer },
    headerMenu,
    footerExplore,
    footerCompany,
    footerBottom,
  };
}
