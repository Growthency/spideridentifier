"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Camera, Check, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

function Saved() {
  return (
    <span className="flex items-center gap-1 text-xs text-emerald-500">
      <Check className="h-3.5 w-3.5" /> Saved
    </span>
  );
}

export function SettingsClient({
  email,
  fullName,
  country,
  avatar,
  plan,
  periodEnd,
}: {
  email: string;
  fullName: string;
  country: string;
  avatar: string | null;
  plan: string;
  periodEnd: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(fullName);
  const [ctry, setCtry] = useState(country);
  const [avatarUrl, setAvatarUrl] = useState(avatar);
  const [newEmail, setNewEmail] = useState(email);
  const [password, setPassword] = useState("");
  const [state, setState] = useState<Record<string, "idle" | "loading" | "done" | string>>({});

  const field =
    "h-11 w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 text-sm focus:border-gold/50 focus:outline-none";
  const set = (k: string, v: string) => setState((s) => ({ ...s, [k]: v }));

  async function saveProfile() {
    set("profile", "loading");
    const supabase = createClient();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!supabase || !data.user) return set("profile", "Not signed in");
    const { error } = await supabase.from("profiles").update({ full_name: name, country: ctry }).eq("id", data.user.id);
    set("profile", error ? error.message : "done");
    router.refresh();
  }

  async function uploadAvatar(file?: File | null) {
    if (!file) return;
    set("avatar", "loading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/avatar", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAvatarUrl(json.url);
      set("avatar", "done");
      router.refresh();
    } catch (e) {
      set("avatar", e instanceof Error ? e.message : "Failed");
    }
  }

  async function changeEmail() {
    set("email", "loading");
    const supabase = createClient();
    const { error } = (await supabase?.auth.updateUser({ email: newEmail })) ?? { error: { message: "n/a" } };
    set("email", error ? error.message : "done");
  }

  async function changePassword() {
    if (password.length < 6) return set("password", "Min 6 characters");
    set("password", "loading");
    const supabase = createClient();
    const { error } = (await supabase?.auth.updateUser({ password })) ?? { error: { message: "n/a" } };
    set("password", error ? error.message : "done");
    if (!error) setPassword("");
  }

  const card = "rounded-3xl border border-foreground/8 bg-card/50 p-6";
  const Btn = ({ k, onClick, label }: { k: string; onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      disabled={state[k] === "loading"}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950 disabled:opacity-60"
    >
      {state[k] === "loading" && <Loader2 className="h-4 w-4 animate-spin" />} {label}
    </button>
  );
  const Status = ({ k }: { k: string }) =>
    state[k] === "done" ? <Saved /> : state[k] && state[k] !== "loading" ? <span className="text-xs text-red-500">{state[k]}</span> : null;

  return (
    <div className="mt-8 space-y-6">
      {/* subscription */}
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-foreground/45">Current plan</p>
            <p className="font-display text-xl font-bold capitalize">{plan}</p>
            {periodEnd && <p className="text-sm text-foreground/55">Renews {formatDate(periodEnd)}</p>}
          </div>
          <Link href="/pricing" className="inline-flex h-10 items-center gap-2 rounded-full border border-gold/40 px-5 text-sm font-semibold hover:bg-gold/10">
            <Sparkles className="h-4 w-4 text-gold" /> {plan === "free" ? "Upgrade" : "Manage plan"}
          </Link>
        </div>
      </div>

      {/* profile */}
      <div className={card}>
        <h2 className="font-display text-lg font-bold">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-gradient text-xl font-bold text-ink-950">
                {(name || email || "U").charAt(0).toUpperCase()}
              </span>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-foreground/10 bg-card"
            >
              {state.avatar === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
          </div>
          <p className="text-xs text-foreground/50">Click the camera to upload a photo.<br />Auto-converted to WebP.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/55">Full name</label>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/55">Country</label>
            <input className={field} value={ctry} onChange={(e) => setCtry(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Btn k="profile" onClick={saveProfile} label="Save profile" />
          <Status k="profile" />
        </div>
      </div>

      {/* email */}
      <div className={card}>
        <h2 className="font-display text-lg font-bold">Email</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-foreground/55">Email address</label>
            <input type="email" className={field} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <Btn k="email" onClick={changeEmail} label="Update email" />
        </div>
        <div className="mt-2"><Status k="email" /></div>
      </div>

      {/* password */}
      <div className={card}>
        <h2 className="font-display text-lg font-bold">Password</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-foreground/55">New password</label>
            <input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <Btn k="password" onClick={changePassword} label="Change password" />
        </div>
        <div className="mt-2"><Status k="password" /></div>
      </div>
    </div>
  );
}
