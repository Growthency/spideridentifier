"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Loader2, Save, Eye, Pencil } from "lucide-react";
import { Markdown } from "@/components/blog/Markdown";
import type { BlogPost } from "@/lib/types";
import { slugify } from "@/lib/utils";

type Draft = Partial<BlogPost> & { tagsInput?: string };

export function PostEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const editing = Boolean(post?.id);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Draft>({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    category: post?.category ?? "Species Guide",
    tagsInput: post?.tags?.join(", ") ?? "",
    author_name: post?.author_name ?? "Dr. Elena Marsh",
    author_role: post?.author_role ?? "Arachnologist",
    author_avatar: post?.author_avatar ?? "",
    read_time: post?.read_time ?? 5,
    region: post?.region ?? "Worldwide",
    level: post?.level ?? "Beginner",
    cover_accent: post?.cover_accent ?? "gold",
    status: post?.status ?? "draft",
    is_featured: post?.is_featured ?? false,
    meta_title: post?.meta_title ?? "",
    meta_description: post?.meta_description ?? "",
  });
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof Draft, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  // Some failures (413 too large, deploy window) return HTML — surface the
  // status instead of a cryptic JSON parse error.
  async function readJson(res: Response): Promise<Record<string, unknown>> {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Server returned ${res.status}${res.status === 413 ? " — file too large" : ""}. Try again in a moment.`);
    }
  }

  async function uploadAvatar(file?: File | null) {
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await readJson(res);
      if (!res.ok) throw new Error(String(json.error || "Upload failed"));
      set("author_avatar", json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setAvatarUploading(false);
      if (avatarRef.current) avatarRef.current.value = "";
    }
  }

  async function uploadImage(file?: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await readJson(res);
      if (!res.ok) throw new Error(String(json.error || "Upload failed"));
      // Insert WebP image markdown at the end of the content.
      set("content", `${form.content ?? ""}\n\n![${file.name.replace(/\.[^.]+$/, "")}](${json.url})\n`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      id: post?.id,
      slug: form.slug?.trim() || slugify(form.title || ""),
      tags: (form.tagsInput || "").split(",").map((t) => t.trim()).filter(Boolean),
      read_time: Number(form.read_time) || 4,
    };
    delete (payload as Draft).tagsInput;
    try {
      const res = await fetch("/api/admin/posts", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(String(json.error || "Could not save"));
      router.push("/admin/pages");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }

  const field =
    "h-11 w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none";
  const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55";

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/pages" className="mb-6 inline-flex items-center gap-2 text-sm text-foreground/55 hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> All pages
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold">{editing ? "Edit post" : "New post"}</h1>
        <button
          onClick={save}
          disabled={saving || !form.title}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 text-sm font-semibold text-ink-950 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {form.status === "published" ? "Save & publish" : "Save draft"}
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-[rgb(var(--crimson-soft))]">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* main */}
        <div className="space-y-4 lg:col-span-2">
          <div>
            <label className={label}>Title</label>
            <input
              className={field}
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!editing) set("slug", slugify(e.target.value));
              }}
              placeholder="Black Widow Spider Identification…"
            />
          </div>
          <div>
            <label className={label}>Slug</label>
            <input className={field} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="black-widow-spider-identification" />
          </div>
          <div>
            <label className={label}>Excerpt</label>
            <textarea
              className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm focus:border-gold/50 focus:outline-none"
              rows={2}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </div>

          {/* content editor */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={label + " mb-0"}>Content (Markdown)</label>
              <div className="flex items-center gap-1 rounded-full bg-foreground/5 p-1 text-xs">
                <button
                  onClick={() => setTab("write")}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 ${tab === "write" ? "bg-gold/20 text-gold" : "text-foreground/50"}`}
                >
                  <Pencil className="h-3 w-3" /> Write
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 ${tab === "preview" ? "bg-gold/20 text-gold" : "text-foreground/50"}`}
                >
                  <Eye className="h-3 w-3" /> Preview
                </button>
              </div>
            </div>
            {tab === "write" ? (
              <textarea
                className="min-h-[420px] w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-3 font-mono text-sm leading-relaxed focus:border-gold/50 focus:outline-none"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="## Heading&#10;&#10;Write your guide in Markdown…"
              />
            ) : (
              <div className="min-h-[420px] rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                <Markdown content={form.content || "_Nothing to preview yet._"} />
              </div>
            )}
            <div className="mt-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-2 text-xs font-medium text-foreground/70 hover:border-gold/40 hover:text-gold disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                Upload image (auto-converted to WebP)
              </button>
            </div>
          </div>
        </div>

        {/* sidebar */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl border border-foreground/8 bg-card/50 p-5">
            <div>
              <label className={label}>Status</label>
              <select className={field} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="draft" className="bg-card">Draft</option>
                <option value="published" className="bg-card">Published</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground/75">
              <input type="checkbox" checked={!!form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="h-4 w-4 accent-[#10b981]" />
              Feature on homepage
            </label>
          </div>

          <div className="space-y-4 rounded-2xl border border-foreground/8 bg-card/50 p-5">
            <div>
              <label className={label}>Category</label>
              <input className={field} value={form.category} onChange={(e) => set("category", e.target.value)} />
            </div>
            <div>
              <label className={label}>Tags (comma separated)</label>
              <input className={field} value={form.tagsInput} onChange={(e) => set("tagsInput", e.target.value)} placeholder="black widow, venomous" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Level</label>
                <select className={field} value={form.level} onChange={(e) => set("level", e.target.value)}>
                  {["Beginner", "Intermediate", "Advanced"].map((l) => (
                    <option key={l} value={l} className="bg-card">{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Read (min)</label>
                <input type="number" min={1} className={field} value={form.read_time} onChange={(e) => set("read_time", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={label}>Region</label>
              <input className={field} value={form.region} onChange={(e) => set("region", e.target.value)} />
            </div>
            <div>
              <label className={label}>Cover accent</label>
              <select className={field} value={form.cover_accent} onChange={(e) => set("cover_accent", e.target.value)}>
                {["gold", "crimson", "dual"].map((a) => (
                  <option key={a} value={a} className="bg-card">{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-foreground/8 bg-card/50 p-5">
            <div>
              <label className={label}>Author</label>
              <input className={field} value={form.author_name} onChange={(e) => set("author_name", e.target.value)} />
            </div>
            <div>
              <label className={label}>Author role</label>
              <input className={field} value={form.author_role} onChange={(e) => set("author_role", e.target.value)} />
            </div>
            <div>
              <label className={label}>Author photo</label>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.author_avatar || "/images/authors/default-avatar.svg"}
                  alt="Author avatar"
                  className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-foreground/10"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    className={field}
                    value={form.author_avatar ?? ""}
                    onChange={(e) => set("author_avatar", e.target.value)}
                    placeholder="Photo URL (or upload below)"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      ref={avatarRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadAvatar(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => avatarRef.current?.click()}
                      disabled={avatarUploading}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-foreground/12 px-3 text-xs font-medium text-foreground/70 hover:bg-foreground/5 disabled:opacity-60"
                    >
                      {avatarUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
                      Upload photo
                    </button>
                    <span className="text-[11px] text-foreground/40">Empty = default avatar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-foreground/8 bg-card/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/45">SEO</p>
            <div>
              <label className={label}>Meta title</label>
              <input className={field} value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} />
            </div>
            <div>
              <label className={label}>Meta description</label>
              <textarea
                className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm focus:border-gold/50 focus:outline-none"
                rows={3}
                value={form.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
