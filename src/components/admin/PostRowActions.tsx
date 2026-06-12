"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { dialogConfirm } from "@/components/ui/Dialog";

export function PostRowActions({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!(await dialogConfirm("Delete this post? This cannot be undone.", "Delete post"))) return;
    setBusy(true);
    await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/${slug}`} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg text-foreground/50 hover:bg-foreground/5 hover:text-gold" title="View">
        <ExternalLink className="h-4 w-4" />
      </Link>
      <Link href={`/admin/pages/edit?slug=${slug}`} className="grid h-8 w-8 place-items-center rounded-lg text-foreground/50 hover:bg-foreground/5 hover:text-gold" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <button onClick={remove} disabled={busy} className="grid h-8 w-8 place-items-center rounded-lg text-foreground/50 hover:bg-red-500/10 hover:text-[rgb(var(--crimson-soft))]" title="Delete">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
