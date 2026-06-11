"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, History, Gem, Bug, ShieldAlert, ArrowRight, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_META } from "@/components/dashboard/DashboardShell";
import type { Profile } from "@/lib/types";

interface ScanRow {
  id: string;
  result: {
    commonName?: string;
    scientificName?: string;
    venomLevel?: string;
  } | null;
  created_at: string;
}

const venomBadge = (level?: string) =>
  level === "dangerous"
    ? "bg-red-500/20 text-red-500"
    : level === "caution"
      ? "bg-amber-500/20 text-amber-500"
      : "bg-green-500/20 text-green-600";

const venomTile = (level?: string) =>
  level === "dangerous" ? "bg-red-500/10" : level === "caution" ? "bg-amber-500/10" : "bg-green-500/10";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRow[]>([]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(data as Profile | null);
      // last 3 scans for the activity preview
      const { data: scans } = await supabase
        .from("analyses")
        .select("id, result, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentScans((scans as ScanRow[]) || []);
    };
    load();
  }, []);

  const credits = profile?.credits ?? 0;
  const plan = profile?.plan ?? "free";
  const meta = PLAN_META[plan] ?? PLAN_META.free;
  const maxCredits = meta.max;
  const creditsUsed = Math.max(0, maxCredits - credits);
  const pct = Math.max(0, Math.min(100, (credits / maxCredits) * 100));
  const planLabel = meta.label;
  const planColor = meta.color;

  // unique species + dangerous flags from the recent scans
  const uniqueSpecies = new Set(recentScans.map((s) => s.result?.scientificName).filter(Boolean)).size;
  const safetyAlerts = recentScans.filter((s) => s.result?.venomLevel === "dangerous").length;

  const stats = [
    { label: "Total Scans", value: profile?.total_identifications ?? 0, icon: <Sparkles className="h-5 w-5" />, color: "#22c55e", bg: "#22c55e18", sub: "identifications" },
    { label: "Credits Remaining", value: credits, icon: <Gem className="h-5 w-5" />, color: "#10b981", bg: "#10b98118", sub: `of ${maxCredits} total` },
    { label: "Unique Species", value: uniqueSpecies, icon: <Bug className="h-5 w-5" />, color: "#0d9488", bg: "#0d948818", sub: "discovered" },
    { label: "Safety Alerts", value: safetyAlerts, icon: <ShieldAlert className="h-5 w-5" />, color: "#ef4444", bg: "#ef444418", sub: "dangerous scans" },
  ];

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-foreground/8 bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium leading-tight text-foreground/45">{s.label}</p>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
            </div>
            <p className="font-display text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="mt-1 text-xs text-foreground/45">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Credits bar */}
      <div className="mb-6 rounded-2xl border border-foreground/8 bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Gem className="h-4 w-4 text-[rgb(var(--gold-soft))]" />
            <span className="text-sm font-semibold text-foreground">Credits Usage</span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: planColor + "20", color: planColor }}
            >
              {planLabel} Plan
            </span>
          </div>
          <span className="text-xs font-medium text-foreground/60">
            {creditsUsed} used · {credits} remaining of {maxCredits}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-foreground/5">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: credits > 10 ? "#10b981" : credits > 0 ? "#f59e0b" : "#ef4444",
            }}
          />
        </div>
        {credits <= 10 && (
          <p className="mt-2 text-xs" style={{ color: credits === 0 ? "#ef4444" : "#f59e0b" }}>
            {credits === 0 ? "All credits used." : "Running low."}{" "}
            <Link href="/pricing" className="font-semibold underline">
              Upgrade plan →
            </Link>
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <h2 className="mb-3 text-base font-semibold text-foreground">Quick Actions</h2>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: "/#identify", icon: <Sparkles className="h-6 w-6" />, label: "New Scan", desc: "Identify a spider with AI", color: "#10b981", bg: "#10b98118" },
          { href: "/dashboard/history", icon: <History className="h-6 w-6" />, label: "Scan History", desc: "View past identifications", color: "#8b5cf6", bg: "#8b5cf618" },
          { href: "/pricing", icon: <Crown className="h-6 w-6" />, label: "Upgrade Plan", desc: "Get more identifications", color: "#f59e0b", bg: "#f59e0b18" },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center gap-4 rounded-2xl border border-foreground/8 bg-card p-4 transition-all hover:scale-[1.02]"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: a.bg, color: a.color }}
            >
              {a.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{a.label}</p>
              <p className="text-xs text-foreground/60">{a.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-foreground/45 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* Recent Scans */}
      <h2 className="mb-3 text-base font-semibold text-foreground">Recent Scans</h2>
      <div className="mb-6 overflow-hidden rounded-2xl border border-foreground/8 bg-card">
        {recentScans.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-3 text-4xl">🕷️</div>
            <p className="mb-1 text-sm font-medium text-foreground">No scans yet</p>
            <p className="mb-4 text-xs text-foreground/45">Upload a spider photo to get started</p>
            <Link
              href="/#identify"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-ink-950"
            >
              <Sparkles className="h-4 w-4" /> Start First Scan
            </Link>
          </div>
        ) : (
          <>
            {recentScans.map((scan, i) => {
              const r = scan.result;
              const date = new Date(scan.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <div
                  key={scan.id}
                  className={`flex items-center gap-4 px-5 py-4 ${i < recentScans.length - 1 ? "border-b border-foreground/8" : ""}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${venomTile(r?.venomLevel)}`}>
                    🕷️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{r?.commonName || "Unknown"}</p>
                    <p className="truncate text-xs text-foreground/45">
                      {r?.scientificName} · {date}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold uppercase ${venomBadge(r?.venomLevel)}`}>
                    {r?.venomLevel}
                  </span>
                </div>
              );
            })}
            <div className="border-t border-foreground/8 px-5 py-3">
              <Link href="/dashboard/history" className="flex items-center gap-1 text-sm font-semibold text-[rgb(var(--gold-soft))]">
                View all history <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Upgrade banner (free only) */}
      {plan === "free" && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5">
          <div className="absolute right-4 top-3 select-none text-5xl opacity-20">🕷️</div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-base font-bold text-white">Unlock More Identifications</p>
              <p className="text-sm text-white/80">Upgrade for monthly credits, priority AI, and expert reports.</p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-600 transition-opacity hover:opacity-90"
            >
              View Plans →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
