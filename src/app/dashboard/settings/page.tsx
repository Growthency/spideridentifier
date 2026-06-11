"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Save,
  Check,
  Camera,
  Crown,
  Zap,
  Star,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_META } from "@/components/dashboard/DashboardShell";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || "");
      setEmail(user.email || "");
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data as Profile);
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
    };
    load();
  }, []);

  /* ── Avatar upload (server route → WebP → storage, bypasses bucket RLS) ── */
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/avatar", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setAvatarUrl(json.url);
      setProfile((p) => (p ? { ...p, avatar_url: json.url } : p));
      // Update the shell's avatar instantly — no reload needed
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { avatar_url: json.url } }));
    } catch (err) {
      setError("Image upload failed: " + (err instanceof Error ? err.message : "unknown error"));
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ── Profile save — server route only (never client-side writes) ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      // Email change goes through Supabase Auth (not the profiles table)
      if (email !== userEmail) {
        const supabase = createClient();
        const { error: emailErr } = (await supabase?.auth.updateUser({ email })) ?? {};
        if (emailErr) throw emailErr;
      }

      setProfile((p) => (p ? { ...p, full_name: fullName } : p));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { full_name: fullName } }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Password change (re-authenticate first) ── */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (!currentPw) {
      setPwError("Enter your current password");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Not configured");
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPw,
      });
      if (signInErr) throw new Error("Current password is incorrect");
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
      if (updateErr) throw updateErr;
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setPwSaving(false);
    }
  };

  const plan = profile?.plan ?? "free";
  const meta = PLAN_META[plan] ?? PLAN_META.free;
  const planLabel = meta.label;
  const planColor = meta.color;
  const maxCredits = meta.max;
  const credits = profile?.credits ?? 0;
  const initials = (profile?.full_name || userEmail || "U").slice(0, 2).toUpperCase();

  const inputCls =
    "w-full rounded-xl border border-foreground/10 bg-foreground/5 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Profile Card ── */}
      <div className="rounded-2xl border border-foreground/8 bg-card p-6">
        <h2 className="mb-1 font-semibold text-foreground">Profile Information</h2>
        <p className="mb-6 text-xs text-foreground/60">Update your photo, name and email</p>

        {/* Avatar upload */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-3">
            <div
              className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white"
              style={{ background: avatarUrl ? "transparent" : "#10b981" }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-ink-950 shadow-lg transition-opacity hover:opacity-80"
              aria-label="Change photo"
            >
              {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
          </div>
          <p className="text-xs text-foreground/45">{avatarUploading ? "Uploading..." : "Tap camera to change photo"}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="your@email.com"
              />
            </div>
            {email !== userEmail && (
              <p className="mt-1 text-xs text-amber-500">⚠️ A confirmation email will be sent to verify the change.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 ${
              saved ? "bg-green-500 text-white" : "bg-brand-gradient text-ink-950"
            }`}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Saved!
              </>
            ) : saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Plan & Credits ── */}
      <div className="rounded-2xl border border-foreground/8 bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: planColor + "20", color: planColor }}
          >
            {plan === "pro" ? <Crown className="h-5 w-5" /> : plan === "explorer" ? <Star className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Plan &amp; Credits</h2>
            <p className="text-xs text-foreground/60">Your current subscription</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-foreground/5 p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{planLabel} Plan</p>
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: planColor + "20", color: planColor }}>
              {planLabel}
            </span>
          </div>
          <p className="text-xs text-foreground/60">{credits} credits remaining · each scan costs 10 credits</p>
        </div>

        <div className="mb-4">
          <div className="mb-1.5 flex justify-between text-xs text-foreground/45">
            <span>Credits remaining</span>
            <span>
              {credits}/{maxCredits}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(0, Math.min(100, (credits / maxCredits) * 100))}%`,
                background: credits > 10 ? "#10b981" : credits > 0 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>

        {plan === "free" && (
          <Link
            href="/pricing"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Crown className="h-4 w-4" /> Upgrade Plan
          </Link>
        )}
      </div>

      {/* ── Change Password ── */}
      <div className="rounded-2xl border border-foreground/8 bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10">
            <KeyRound className="h-5 w-5 text-[rgb(var(--gold-soft))]" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Change Password</h2>
            <p className="text-xs text-foreground/60">Update your account password</p>
          </div>
        </div>

        {pwError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" /> {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {(
            [
              { label: "Current Password", value: currentPw, set: setCurrentPw, show: showCurr, toggle: setShowCurr, placeholder: "Enter current password" },
              { label: "New Password", value: newPw, set: setNewPw, show: showNew, toggle: setShowNew, placeholder: "At least 6 characters" },
              { label: "Confirm New Password", value: confirmPw, set: setConfirmPw, show: showConf, toggle: setShowConf, placeholder: "Repeat new password" },
            ] as const
          ).map((f) => (
            <div key={f.label}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                <input
                  type={f.show ? "text" : "password"}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className={inputCls + " pr-10"}
                  placeholder={f.placeholder}
                />
                <button
                  type="button"
                  onClick={() => f.toggle((v: boolean) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                  aria-label={f.show ? "Hide password" : "Show password"}
                >
                  {f.show ? <EyeOff className="h-4 w-4 text-foreground/60" /> : <Eye className="h-4 w-4 text-foreground/60" />}
                </button>
              </div>
              {f.label === "Confirm New Password" && confirmPw && newPw && confirmPw !== newPw && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={pwSaving}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 ${
              pwSaved ? "bg-green-500 text-white" : "bg-brand-gradient text-ink-950"
            }`}
          >
            {pwSaved ? (
              <>
                <Check className="h-4 w-4" /> Password Updated!
              </>
            ) : pwSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" /> Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
