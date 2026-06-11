"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FileText, Inbox, Users, CreditCard, ExternalLink, LogOut, Menu, X, PlusCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const nav = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Blog posts", href: "/admin/posts", icon: FileText },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Messages", href: "/admin/messages", icon: Inbox },
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

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
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
          href="/admin/posts/new"
          onClick={() => setOpen(false)}
          className="mt-2 flex items-center gap-3 rounded-xl bg-brand-gradient px-3 py-2.5 text-sm font-semibold text-ink-950"
        >
          <PlusCircle className="h-4.5 w-4.5" /> New post
        </Link>
      </nav>
      <div className="space-y-1 border-t border-foreground/8 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/65 hover:bg-foreground/5"
        >
          <ExternalLink className="h-4.5 w-4.5" /> View site
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/65 hover:bg-red-500/10 hover:text-[rgb(var(--crimson-soft))]"
        >
          <LogOut className="h-4.5 w-4.5" /> Sign out
        </button>
        <p className="truncate px-3 pt-2 text-xs text-foreground/35">{email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen border-r border-foreground/8 bg-card/60 lg:block">{SidebarContent}</aside>

      {/* mobile header */}
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
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className="min-w-0 p-5 sm:p-8">{children}</main>
    </div>
  );
}
