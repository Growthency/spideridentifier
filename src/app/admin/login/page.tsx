"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured yet. Add your keys to .env.local first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const field =
    "h-12 w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none";

  return (
    <div className="grid min-h-screen place-items-center px-5 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6">
            <Logo />
          </Link>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-ink-950">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-foreground/55">Manage posts, media and messages.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-3xl border border-foreground/8 bg-card/60 p-6">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />

          {error && (
            <p className="flex items-start gap-2 text-sm text-[rgb(var(--crimson-soft))]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-semibold text-ink-950 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>

          {!supabaseConfigured && (
            <p className="text-center text-xs text-foreground/40">
              Add Supabase keys to .env.local to enable the admin.
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-foreground/40">
          <Link href="/" className="hover:text-gold">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
