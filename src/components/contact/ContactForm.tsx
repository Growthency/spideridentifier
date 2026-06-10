"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const subjects = ["Identify a spider", "Report a bug", "Partnership", "Press", "Something else"];

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: subjects[0], message: "" });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setForm({ name: "", email: "", subject: subjects[0], message: "" });
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        <h3 className="font-display text-xl font-bold">Message sent!</h3>
        <p className="max-w-sm text-sm text-foreground/65">
          Thanks for reaching out — we typically reply within one to two business days.
        </p>
        <button onClick={() => setState("idle")} className="mt-2 text-sm font-medium text-gold hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  const field = "h-12 w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-foreground/8 bg-card/50 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/75">Name</label>
          <input required value={form.name} onChange={update("name")} placeholder="Your name" className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/75">Email</label>
          <input required type="email" value={form.email} onChange={update("email")} placeholder="you@email.com" className={field} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/75">Subject</label>
        <select value={form.subject} onChange={update("subject")} className={field}>
          {subjects.map((s) => (
            <option key={s} value={s} className="bg-card">
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/75">Message</label>
        <textarea
          required
          value={form.message}
          onChange={update("message")}
          rows={5}
          placeholder="How can we help?"
          className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none"
        />
      </div>

      {state === "error" && (
        <p className="flex items-center gap-2 text-sm text-[rgb(var(--crimson-soft))]">
          <AlertCircle className="h-4 w-4" /> Something went wrong. Please try again or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-semibold text-ink-950 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
        Send message
      </button>
    </form>
  );
}
