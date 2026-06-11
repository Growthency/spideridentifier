import Link from "next/link";
import { ScanSearch, History, Sparkles, Coins, Bug, ShieldAlert, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { VenomBadge } from "@/components/ui/VenomBadge";
import { formatDate } from "@/lib/utils";
import type { Analysis } from "@/lib/types";

export default async function DashboardOverview() {
  const profile = await getProfile();
  const supabase = await createClient();

  let recent: Analysis[] = [];
  if (supabase && profile) {
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50);
    recent = (data as Analysis[]) ?? [];
  }

  const total = profile?.total_identifications ?? recent.length;
  const uniqueSpecies = new Set(recent.map((r) => r.result?.scientificName)).size;
  const dangerous = recent.filter((r) => r.result?.venomLevel === "dangerous").length;

  const stats = [
    { label: "Credits left", value: (profile?.credits ?? 0).toLocaleString("en-US"), icon: Coins },
    { label: "Identifications", value: total.toLocaleString("en-US"), icon: ScanSearch },
    { label: "Unique species", value: uniqueSpecies.toLocaleString("en-US"), icon: Bug },
    { label: "Dangerous flagged", value: dangerous.toLocaleString("en-US"), icon: ShieldAlert },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-foreground/55">Here&apos;s your spider activity at a glance.</p>
        </div>
        <Link
          href="/#identify"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950"
        >
          <ScanSearch className="h-4.5 w-4.5" /> Identify a spider
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-foreground/8 bg-card/50 p-6">
            <s.icon className="h-6 w-6 text-gold" />
            <p className="mt-4 font-display text-3xl font-extrabold">{s.value}</p>
            <p className="mt-1 text-sm text-foreground/55">{s.label}</p>
          </div>
        ))}
      </div>

      {profile?.plan === "free" && (
        <Link
          href="/pricing"
          className="mt-6 flex items-center justify-between gap-4 rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-crimson/10 p-6 transition-transform hover:-translate-y-0.5"
        >
          <div>
            <p className="font-display text-lg font-bold">Want unlimited identifications?</p>
            <p className="mt-1 text-sm text-foreground/65">Upgrade for more credits, look-alike alerts and history.</p>
          </div>
          <Sparkles className="h-8 w-8 shrink-0 text-gold" />
        </Link>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent scans</h2>
          <Link href="/dashboard/history" className="flex items-center gap-1 text-sm text-gold hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-foreground/8 bg-card/50 p-12 text-center">
            <History className="h-10 w-10 text-foreground/30" />
            <p className="mt-4 font-medium">No identifications yet</p>
            <p className="mt-1 text-sm text-foreground/50">Upload a spider photo to get started.</p>
            <Link href="/#identify" className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950">
              <ScanSearch className="h-4 w-4" /> Identify now
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-2xl border border-foreground/8 bg-card/50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{a.result?.commonName}</p>
                  {a.result?.venomLevel && <VenomBadge level={a.result.venomLevel} />}
                </div>
                <p className="truncate text-xs italic text-foreground/50">{a.result?.scientificName}</p>
                <p className="mt-2 text-xs text-foreground/45">{formatDate(a.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
