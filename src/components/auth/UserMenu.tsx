"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setReady(true);
      return;
    }
    const loadProfile = async (id: string) => {
      const { data } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", id).maybeSingle();
      if (data) setProfile(data);
    };
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
      if (data.user) loadProfile(data.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });
    // Settings broadcasts avatar/name changes — refresh instantly.
    const onProfileUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { full_name?: string; avatar_url?: string };
      setProfile((p) => ({ full_name: detail.full_name ?? p?.full_name ?? null, avatar_url: detail.avatar_url ?? p?.avatar_url ?? null }));
    };
    window.addEventListener("profile-updated", onProfileUpdated);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("profile-updated", onProfileUpdated);
    };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!ready) return <div className="hidden h-10 w-10 sm:block" aria-hidden="true" />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden h-9 items-center rounded-full px-3.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:inline-flex"
      >
        Sign in
      </Link>
    );
  }

  const name = profile?.full_name || (user.user_metadata?.full_name as string) || user.email || "User";
  const initial = name.trim().charAt(0).toUpperCase();
  // Uploaded profile photo wins; OAuth picture is the fallback.
  const avatar = profile?.avatar_url || (user.user_metadata?.avatar_url as string | undefined);

  const item = "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="grid h-10 w-10 place-items-center overflow-hidden rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-105"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center bg-brand-gradient text-sm font-bold text-ink-950">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-foreground/10 bg-card p-1.5 shadow-card">
          <div className="border-b border-foreground/8 px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-foreground/50">{user.email}</p>
          </div>
          <div className="py-1">
            <Link href="/dashboard" onClick={() => setOpen(false)} className={cn(item, "text-foreground/80 hover:bg-foreground/5")}>
              <LayoutDashboard className="h-4 w-4 text-gold" /> Dashboard
            </Link>
            <Link href="/dashboard/settings" onClick={() => setOpen(false)} className={cn(item, "text-foreground/80 hover:bg-foreground/5")}>
              <Settings className="h-4 w-4 text-gold" /> Settings
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className={cn(item, "text-foreground/80 hover:bg-foreground/5")}>
              <Sparkles className="h-4 w-4 text-gold" /> Upgrade
            </Link>
          </div>
          <div className="border-t border-foreground/8 pt-1">
            <button onClick={signOut} className={cn(item, "w-full text-foreground/80 hover:bg-red-500/10 hover:text-red-500")}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
