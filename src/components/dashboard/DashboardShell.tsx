"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  History,
  LogOut,
  Gem,
  TrendingUp,
  Crown,
  Zap,
  Star,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Settings,
  Users,
  Bookmark,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const NAV = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Sparkles, label: "New Scan", href: "/#identify" },
  { icon: History, label: "Scan History", href: "/dashboard/history" },
  { icon: Bookmark, label: "Saved Articles", href: "/dashboard/saved" },
  { icon: TrendingUp, label: "Pricing & Plans", href: "/pricing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: Users, label: "Referrals", href: "/dashboard/referral" },
];

const BOTTOM_NAV = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: Sparkles, label: "New Scan", href: "/#identify" },
  { icon: History, label: "History", href: "/dashboard/history" },
  { icon: Bookmark, label: "Saved", href: "/dashboard/saved" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const PLAN_META: Record<string, { label: string; color: string; max: number }> = {
  free: { label: "Free", color: "#10b981", max: 30 },
  starter: { label: "Starter", color: "#3b82f6", max: 120 },
  explorer: { label: "Explorer", color: "#8b5cf6", max: 550 },
  pro: { label: "Pro", color: "#f59e0b", max: 1200 },
};

export function DashboardShell({
  profile: initialProfile,
  email,
  children,
}: {
  profile: Profile;
  email: string;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Settings page broadcasts avatar / name changes — update instantly,
  // no reload needed.
  useEffect(() => {
    const onProfileUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<Profile>;
      setProfile((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener("profile-updated", onProfileUpdated);
    return () => window.removeEventListener("profile-updated", onProfileUpdated);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const credits = profile.credits ?? 0;
  const plan = profile.plan ?? "free";
  const meta = PLAN_META[plan] ?? PLAN_META.free;
  const maxCredits = meta.max;
  const pct = Math.max(0, Math.min(100, (credits / maxCredits) * 100));
  const planLabel = meta.label;
  const planColor = meta.color;

  // Subscription state — drives the "Manage" button + status banners
  const subStatus = profile.subscription_status ?? undefined;
  const periodEnd = profile.current_period_end ?? undefined;
  const isSubscribed = Boolean(profile.subscription_id) && subStatus !== "canceled";
  const isCanceling = subStatus === "canceled" && periodEnd && new Date(periodEnd) > new Date();
  const formattedPeriodEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  // Open the Paddle customer portal (cancel, update payment, invoices).
  async function openSubscriptionPortal() {
    try {
      const res = await fetch("/api/subscription/manage", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error || "Could not open subscription portal. Try again in a moment.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not open subscription portal.");
    }
  }

  const initials = (profile.full_name || email || "U").slice(0, 2).toUpperCase();
  const firstName = profile.full_name?.split(" ")[0] || email.split("@")[0] || "there";
  const avatarUrl = profile.avatar_url;

  const pageTitle = (() => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname?.includes("/history")) return "Scan History";
    if (pathname?.includes("/saved")) return "Saved Articles";
    if (pathname?.includes("/referral")) return "Referrals";
    if (pathname?.includes("/settings")) return "Settings";
    return "Dashboard";
  })();

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const Avatar = ({ px = 36 }: { px?: number }) => (
    <Link href="/dashboard/settings" title="Go to Settings">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white transition-all hover:ring-2 hover:ring-gold"
        style={{ width: px, height: px, background: avatarUrl ? "transparent" : "#10b981" }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
    </Link>
  );

  const SidebarContent = (
    <div className="flex h-full flex-col bg-card">
      {/* Logo */}
      <Link href="/" className="mb-2 flex items-center gap-3 px-6 py-5" onClick={() => setSidebarOpen(false)}>
        <span className="text-2xl">🕷️</span>
        <span className="font-display text-lg font-bold text-foreground">
          Spider<span className="text-gold">Identifier</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href.split("#")[0]) && item.href !== "/#identify";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active ? "bg-gold/10 text-[rgb(var(--gold-soft))]" : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-[rgb(var(--gold-soft))]" : "text-foreground/40"}`} />
              {item.label}
              {active && <ChevronRight className="ml-auto h-4 w-4 text-[rgb(var(--gold-soft))]" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-3 border-t border-foreground/8 px-3 pb-4 pt-3">
        {/* Credits mini bar */}
        <div className="rounded-xl bg-foreground/5 px-4 py-3">
          <div className="mb-2 flex justify-between text-xs text-foreground/45">
            <span className="flex items-center gap-1">
              <Gem className="h-3 w-3" /> Credits
            </span>
            <span className="font-semibold text-[rgb(var(--gold-soft))]">
              {credits}/{maxCredits}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: credits > 10 ? "#10b981" : credits > 0 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* User row — avatar links to settings */}
        <div className="flex items-center gap-3 px-2">
          <Avatar />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{profile.full_name || firstName}</p>
            <p className="truncate text-xs text-foreground/45">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-foreground/45 transition-opacity hover:opacity-70"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-foreground/8 bg-card md:flex">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute bottom-0 left-0 top-0 flex w-72 flex-col border-r border-foreground/8 bg-card">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-foreground/45"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-foreground/8 bg-card px-4 py-3 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-foreground" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-base font-bold text-foreground">🕷️ {pageTitle}</span>
          <span className="w-9" aria-hidden="true" />
        </header>

        {/* Desktop top bar */}
        <header className="hidden items-center justify-between border-b border-foreground/8 bg-card px-8 py-4 md:flex">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {pathname === "/dashboard" ? `${greeting}, ${firstName} 👋` : pageTitle}
            </h1>
            <p className="text-sm text-foreground/60">
              {pathname === "/dashboard"
                ? "Here's your spider identification overview"
                : pathname?.includes("/history")
                  ? "View and manage your past identifications"
                  : pathname?.includes("/saved")
                    ? "Guides you bookmarked for later"
                    : pathname?.includes("/referral")
                      ? "Invite friends and earn free credits together"
                      : pathname?.includes("/settings")
                        ? "Manage your account and preferences"
                        : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
              style={{ background: planColor + "20", color: planColor, border: `1px solid ${planColor}40` }}
            >
              {plan === "pro" ? <Crown className="h-3 w-3" /> : plan === "explorer" ? <Star className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
              {planLabel} Plan
            </span>
            {/* Manage subscription (paid plans) — Paddle customer portal */}
            {(isSubscribed || isCanceling) && (
              <button
                onClick={openSubscriptionPortal}
                className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-3 py-1.5 text-xs font-semibold text-foreground/60 transition-opacity hover:opacity-80"
                title="Manage subscription, payment method, and invoices"
              >
                Manage
              </button>
            )}
            {plan === "free" && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-ink-950 transition-opacity hover:opacity-80"
              >
                Upgrade
              </Link>
            )}
          </div>
        </header>

        {/* Subscription canceled banner — access until period end */}
        {isCanceling && formattedPeriodEnd && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-500 md:px-8">
            <p className="text-sm">
              <strong>Subscription canceled.</strong> You have full access until <strong>{formattedPeriodEnd}</strong>,
              then your plan returns to Free.
            </p>
            <Link
              href="/pricing"
              className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-80"
            >
              Resubscribe
            </Link>
          </div>
        )}

        {/* Past-due banner — payment failed, Paddle is retrying */}
        {subStatus === "past_due" && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-red-500 md:px-8">
            <p className="text-sm">
              <strong>Payment failed.</strong> Update your payment method to keep your subscription active.
            </p>
            <button
              onClick={openSubscriptionPortal}
              className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-80"
            >
              Update payment
            </button>
          </div>
        )}

        {/* Page Body */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
          {pathname === "/dashboard" && (
            <div className="mb-5 md:hidden">
              <h1 className="mb-0.5 font-display text-2xl font-bold text-foreground">
                {greeting}, {firstName} 👋
              </h1>
              <p className="text-sm text-foreground/60">Your identification overview</p>
            </div>
          )}
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-foreground/8 bg-card px-2 py-2 md:hidden">
        {BOTTOM_NAV.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(item.href) && item.href !== "/#identify";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all ${
                active ? "bg-gold/10 text-[rgb(var(--gold-soft))]" : "text-foreground/45"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
