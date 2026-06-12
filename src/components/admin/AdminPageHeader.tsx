import type { LucideIcon } from "lucide-react";

export function AdminPageHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
        <Icon className="h-5 w-5 text-[rgb(var(--gold-soft))]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-foreground/55">{subtitle}</p>
      </div>
    </div>
  );
}

export function SaveBar({
  saving,
  saved,
  error,
  onSave,
  label = "Save Changes",
}: {
  saving: boolean;
  saved: boolean;
  error: string;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        onClick={onSave}
        disabled={saving}
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 ${
          saved ? "bg-green-500 text-white" : "bg-brand-gradient text-ink-950"
        }`}
      >
        {saved ? "Saved!" : saving ? "Saving…" : label}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
