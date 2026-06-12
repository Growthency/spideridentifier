"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Home as HomeIcon,
  Trophy,
  ShieldCheck,
  Globe,
  CreditCard,
  Code,
  ExternalLink as ExternalLinkIcon,
  ListOrdered,
  Palette,
  Droplet,
  Paintbrush,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/homepage", label: "Homepage", icon: HomeIcon },
  { href: "/admin/rank-tracker", label: "Rank Tracker", icon: Trophy },
  { href: "/admin/seo-health", label: "SEO Health", icon: ShieldCheck },
  { href: "/admin/indexing-report", label: "Indexing Report", icon: Globe },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/header-scripts", label: "Header Scripts", icon: Code },
  { href: "/admin/external-links", label: "External Links", icon: ExternalLinkIcon },
  { href: "/admin/menus", label: "Menus", icon: ListOrdered },
  { href: "/admin/footer-settings", label: "Footer Content", icon: Palette },
  { href: "/admin/theme", label: "Theme Colors", icon: Droplet },
  { href: "/admin/custom-css", label: "Custom CSS", icon: Paintbrush },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden w-[260px] flex-col border-r border-foreground/8 bg-card lg:flex">
        {/* Logo */}
        <div className="border-b border-foreground/8 px-6 py-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
              S
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-foreground">Admin</span>
              <span className="ml-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">Menu</p>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                isActive(href)
                  ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-[rgb(var(--gold-soft))] shadow-sm shadow-emerald-500/5"
                  : "text-foreground/55 hover:bg-foreground/5"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
              {isActive(href) && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-foreground/8 px-4 py-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 text-xs font-bold text-emerald-500 ring-1 ring-emerald-500/20">
              {(email[0] || "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-foreground">{email}</p>
              <p className="text-[10px] font-medium text-foreground/40">Administrator</p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-foreground/55 transition-colors hover:bg-foreground/5"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            View site
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-foreground/55 transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-foreground/8 bg-card/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white">
            S
          </div>
          <span className="text-sm font-bold text-foreground">Admin</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-1 text-foreground/60" aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {open && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-card/95 pt-14 backdrop-blur-xl lg:hidden">
          <nav className="space-y-1 px-4 py-4">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  isActive(href) ? "bg-emerald-500/10 text-[rgb(var(--gold-soft))]" : "text-foreground/55"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/55"
            >
              <LogOut className="h-[18px] w-[18px]" /> Sign out
            </button>
          </nav>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1400px] p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
