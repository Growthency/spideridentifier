"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase isn't configured yet. Add your keys to .env.local.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push(next);
    router.refresh();
  }

  const field =
    "h-12 w-full rounded-2xl border border-foreground/10 bg-foreground/5 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none";

  return (
    <div className="grid min-h-screen place-items-center px-5 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6">
            <Logo />
          </Link>
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-foreground/55">Sign in to your Spider Identifier account.</p>
        </div>

        <div className="space-y-4 rounded-3xl border border-foreground/8 bg-card/60 p-6">
          <GoogleButton next={next} label="Continue with Google" />

          <div className="flex items-center gap-3 text-xs text-foreground/40">
            <span className="h-px flex-1 bg-foreground/10" /> or <span className="h-px flex-1 bg-foreground/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
            </div>

            {error && (
              <p className="flex items-start gap-2 text-sm text-red-500">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-semibold text-ink-950 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </button>
          </form>

          {!supabaseConfigured && (
            <p className="text-center text-xs text-foreground/40">Add Supabase keys to .env.local to enable accounts.</p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-foreground/55">
          New here?{" "}
          <Link href="/signup" className="font-medium text-gold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LoginPageClient() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
