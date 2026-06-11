"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, User, Mail, Lock, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

function SignupInner() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";
  const [form, setForm] = useState({ full_name: "", email: "", country: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    const supabase = createClient();
    if (!supabase) return setError("Supabase isn't configured yet. Add your keys to .env.local.");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, country: form.country },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    // If email confirmation is required, there is no active session yet.
    if (data.session) {
      router.push(next);
      router.refresh();
    } else {
      setConfirm(true);
    }
  }

  const field =
    "h-12 w-full rounded-2xl border border-foreground/10 bg-foreground/5 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none";

  if (confirm) {
    return (
      <div className="grid min-h-screen place-items-center px-5 py-24">
        <div className="w-full max-w-sm rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h1 className="mt-4 font-display text-xl font-bold">Check your inbox</h1>
          <p className="mt-2 text-sm text-foreground/65">
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="mt-5 inline-block text-sm font-medium text-gold hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6">
            <Logo />
          </Link>
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-foreground/55">Start with 30 free credits — no card required.</p>
        </div>

        <div className="space-y-4 rounded-3xl border border-foreground/8 bg-card/60 p-6">
          <GoogleButton next={next} label="Sign up with Google" />
          <div className="flex items-center gap-3 text-xs text-foreground/40">
            <span className="h-px flex-1 bg-foreground/10" /> or <span className="h-px flex-1 bg-foreground/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input required placeholder="Full name" value={form.full_name} onChange={set("full_name")} className={field} />
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input type="email" required placeholder="Email" value={form.email} onChange={set("email")} className={field} />
            </div>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input placeholder="Country (optional)" value={form.country} onChange={set("country")} className={field} />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input type="password" required placeholder="Password (min 6 characters)" value={form.password} onChange={set("password")} className={field} />
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
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
            </button>
          </form>

          {!supabaseConfigured && (
            <p className="text-center text-xs text-foreground/40">Add Supabase keys to .env.local to enable accounts.</p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-foreground/55">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export function SignupPageClient() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}
