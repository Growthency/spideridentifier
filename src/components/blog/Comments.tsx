"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CommentRow {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

/**
 * Reader comments under every article — list loads client-side so it stays
 * fresh on ISR-cached pages; posting requires a signed-in account.
 */
export function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setSignedIn(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    supabase
      .from("comments")
      .select("id, author_name, body, created_at")
      .eq("post_slug", slug)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => setComments((data as CommentRow[]) ?? []));
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, body: body.trim() }),
      });
      const text = await res.text();
      let json: { error?: string; comment?: CommentRow };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Server returned ${res.status} — please try again`);
      }
      if (!res.ok) throw new Error(json.error || "Could not post comment");
      if (json.comment) setComments((c) => [json.comment!, ...c]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setPosting(false);
    }
  }

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-foreground/8 pt-10">
      <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold">
        <MessageCircle className="h-5 w-5 text-[rgb(var(--gold-soft))]" /> Comments
      </h2>

      {/* list */}
      {comments.length === 0 ? (
        <p className="mb-8 text-sm text-foreground/55">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <ul className="mb-8 space-y-5">
          {comments.map((c) => (
            <li key={c.id} className="rounded-2xl border border-foreground/8 bg-card/50 p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-[10px] font-bold text-ink-950">
                  {c.author_name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-foreground">{c.author_name}</span>
                <span className="text-xs text-foreground/40">· {date(c.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/75">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {/* form */}
      <div className="border-t border-foreground/8 pt-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Leave a comment</h3>
        {signedIn === false ? (
          <div className="rounded-2xl border border-foreground/8 bg-card/50 p-5 text-center">
            <p className="mb-3 text-sm text-foreground/60">Sign in to join the discussion.</p>
            <Link
              href={`/login?next=/blog/${slug}`}
              className="inline-flex h-10 items-center rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Share your thoughts or experiences…"
              className="w-full rounded-2xl border border-foreground/10 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={posting || !body.trim() || signedIn === null}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-6 text-sm font-semibold text-ink-950 disabled:opacity-50"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post Comment
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
