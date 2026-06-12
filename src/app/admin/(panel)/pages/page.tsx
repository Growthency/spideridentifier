import Link from "next/link";
import { PlusCircle, FileText } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

async function getAllPosts(): Promise<BlogPost[] | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.from("blog_posts").select("*").order("published_at", { ascending: false });
    return (data as BlogPost[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Pages</h1>
          <p className="mt-1 text-sm text-foreground/55">Create, edit and publish your articles and guides.</p>
        </div>
        <Link href="/admin/pages/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950">
          <PlusCircle className="h-4.5 w-4.5" /> New post
        </Link>
      </div>

      {posts === null ? (
        <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-sm text-foreground/70">
          Configure Supabase in <code className="text-gold">.env.local</code> and run{" "}
          <code className="text-gold">supabase/schema.sql</code> + <code className="text-gold">supabase/seed.sql</code> to manage posts here.
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-3xl border border-foreground/8 bg-card/50 p-16 text-center">
          <FileText className="h-10 w-10 text-foreground/30" />
          <p className="mt-4 font-medium">No posts yet</p>
          <p className="mt-1 text-sm text-foreground/50">Write your first guide or run the seed script.</p>
          <Link href="/admin/pages/new" className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-ink-950">
            <PlusCircle className="h-4 w-4" /> New post
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-foreground/8">
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.02] text-left text-xs uppercase tracking-wide text-foreground/45">
              <tr>
                <th className="p-4 font-medium">Title</th>
                <th className="hidden p-4 font-medium sm:table-cell">Status</th>
                <th className="hidden p-4 font-medium md:table-cell">Category</th>
                <th className="hidden p-4 font-medium lg:table-cell">Date</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-foreground/8">
                  <td className="max-w-xs p-4">
                    <p className="truncate font-medium">{p.title}</p>
                    {p.is_featured && <span className="text-xs text-gold">★ Featured</span>}
                  </td>
                  <td className="hidden p-4 sm:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.status === "published" ? "bg-emerald-500/12 text-emerald-300" : "bg-foreground/8 text-foreground/60"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="hidden p-4 text-foreground/65 md:table-cell">{p.category}</td>
                  <td className="hidden p-4 text-foreground/50 lg:table-cell">{formatDate(p.published_at)}</td>
                  <td className="p-4">
                    <PostRowActions id={p.id!} slug={p.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
