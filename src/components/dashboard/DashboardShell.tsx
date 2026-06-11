"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, History, Bookmark, Gift, Settings, ScanSearch, LogOut, Menu, X, Coins } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const nav = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Scan history", href: "/dashboard/history", icon: History },
  { title: "Saved guides", href: "/dashboard/saved", icon: Bookmark },
  { title: "Referrals", href: "/dashboard/referral", icon: Gift },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({
  name,
  email,
  credits,
  plan,
  avatar,
  children,
}: {
  name: string;
  email: string;
  credits: number;
  plan: string;
  avatar?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      {/* credits */}
      <div className="mx-3 mb-3 rounded-2xl border border-gold/20 bg-gold/[0.06] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--gold-soft))]">
          <Coins className="h-4 w-4" /> Credits
        </div>
        <p className="mt-1 font-display text-2xl font-extrabold">{credits.toLocaleString("en-US")}</p>
        <p className="text-xs capitalize text-foreground/50">{plan} plan</p>
        {plan === "free" && (
          <Link href="/pricing" className="mt-2 inline-block text-xs font-semibold text-gold hover:underline">
            Upgrade for more →
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href) ? "bg-gold/10 text-gold" : "text-foreground/65 hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.title}
          </Link>
        ))}
        <Link
          href="/#identify"
          className="mt-2 flex items-center gap-3 rounded-xl bg-brand-gradient px-3 py-2.5 text-sm font-semibold text-ink-950"
        >
          <ScanSearch className="h-4.5 w-4.5" /> Identify a spider
        </Link>
      </nav>

      <div className="border-t border-foreground/8 p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/65 hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="h-4.5 w-4.5" /> Sign out
        </button>
        <div className="flex items-center gap-2.5 px-3 pt-2">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-ink-950">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground/80">{name}</p>
            <p className="truncate text-[11px] text-foreground/45">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-foreground/8 bg-card/60 lg:block">{Sidebar}</aside>

      <div className="flex items-center justify-between border-b border-foreground/8 bg-card/60 px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full glass">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-foreground/8 bg-card">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-full glass">
              <X className="h-4 w-4" />
            </button>
            {Sidebar}
          </aside>
        </div>
      )}

      <main className="min-w-0 p-5 sm:p-8">{children}</main>
    </div>
  );
}
