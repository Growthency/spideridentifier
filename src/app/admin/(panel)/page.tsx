import Link from "next/link";
import { FileText, Inbox, Mail, Eye, PlusCircle, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

async function counts() {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const safe = async (table: string, filter?: (q: any) => any) => {
    try {
      let q = supabase.from(table).select("*", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count } = await q;
      return count ?? 0;
    } catch {
      return 0;
    }
  };
  return {
    published: await safe("blog_posts", (q) => q.eq("status", "published")),
    drafts: await safe("blog_posts", (q) => q.eq("status", "draft")),
    messages: await safe("contact_submissions"),
    subscribers: await safe("newsletter_subscribers"),
  };
}

export default async function AdminOverview() {
  const data = await counts();

  const cards = [
    { label: "Published posts", value: data?.published ?? "—", icon: FileText, href: "/admin/posts" },
    { label: "Drafts", value: data?.drafts ?? "—", icon: Eye, href: "/admin/posts" },
    { label: "Messages", value: data?.messages ?? "—", icon: Inbox, href: "/admin/messages" },
    { label: "Subscribers", value: data?.subscribers ?? "—", icon: Mail, href: "/admin/messages" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Overview</h1>
          <p className="mt-1 text-sm text-foreground/55">Welcome back — here&apos;s your content at a glance.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950"
        >
          <PlusCircle className="h-4.5 w-4.5" /> New post
        </Link>
      </div>

      {!data && (
        <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-foreground/70">
          Supabase isn&apos;t configured yet. Add your keys to <code className="text-gold">.env.local</code> and run the
          SQL in <code className="text-gold">supabase/schema.sql</code> to activate the dashboard.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-3xl border border-foreground/8 bg-card/50 p-6 transition-all hover:-translate-y-1 hover:border-gold/30"
          >
            <c.icon className="h-6 w-6 text-gold" />
            <p className="mt-4 font-display text-3xl font-extrabold">{c.value}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-foreground/55">
              {c.label}
              <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-foreground/8 bg-card/50 p-6">
        <h2 className="font-display text-lg font-bold">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link href="/admin/posts/new" className="rounded-2xl border border-foreground/8 p-4 text-sm hover:border-gold/30">
            <PlusCircle className="mb-2 h-5 w-5 text-gold" /> Write a new post
          </Link>
          <Link href="/admin/posts" className="rounded-2xl border border-foreground/8 p-4 text-sm hover:border-gold/30">
            <FileText className="mb-2 h-5 w-5 text-gold" /> Manage posts
          </Link>
          <Link href="/admin/messages" className="rounded-2xl border border-foreground/8 p-4 text-sm hover:border-gold/30">
            <Inbox className="mb-2 h-5 w-5 text-gold" /> Read messages
          </Link>
        </div>
      </div>
    </div>
  );
}
