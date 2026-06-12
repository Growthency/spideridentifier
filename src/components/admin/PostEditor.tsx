"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  ImagePlus,
  Upload,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Minus,
  Table,
  Link2,
  FileCode2,
  Search,
  Pilcrow,
} from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { DEFAULT_EDITOR_OPTIONS, type EditorOptions } from "@/lib/siteDefaults";

export interface InterlinkCandidate {
  phrase: string;
  href: string;
}

type Draft = Partial<BlogPost> & { tagsInput?: string };

/* Markdown → HTML for legacy posts opened in the rich editor. Covers the
   syntax our seed content uses; new posts are stored as HTML directly. */
function mdToHtml(md: string): string {
  if (/<\/?(p|h[1-6]|ul|ol|div|img|table|blockquote)\b/i.test(md)) return md; // already HTML
  const inline = (s: string) =>
    s
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html = blocks
    .map((block) => {
      const b = block.trim();
      if (!b) return "";
      if (/^#{1,4}\s/.test(b)) {
        const level = Math.min(4, (/^#+/.exec(b)?.[0].length ?? 2));
        return `<h${level}>${inline(b.replace(/^#+\s*/, ""))}</h${level}>`;
      }
      if (/^---+$/.test(b)) return "<hr />";
      if (/^>/.test(b)) return `<blockquote>${inline(b.replace(/^>\s?/gm, ""))}</blockquote>`;
      if (/^[-*]\s/m.test(b) && b.split("\n").every((l) => /^[-*]\s/.test(l.trim()))) {
        return `<ul>${b
          .split("\n")
          .map((l) => `<li>${inline(l.replace(/^[-*]\s*/, ""))}</li>`)
          .join("")}</ul>`;
      }
      if (/^\d+\.\s/m.test(b) && b.split("\n").every((l) => /^\d+\.\s/.test(l.trim()))) {
        return `<ol>${b
          .split("\n")
          .map((l) => `<li>${inline(l.replace(/^\d+\.\s*/, ""))}</li>`)
          .join("")}</ol>`;
      }
      if (/^\|/.test(b)) {
        const rows = b.split("\n").filter((l) => /^\|/.test(l) && !/^\|[\s:-]+\|/.test(l));
        const cells = (l: string) => l.split("|").slice(1, -1).map((c) => c.trim());
        const [head, ...body] = rows;
        if (!head) return "";
        return `<table><thead><tr>${cells(head)
          .map((c) => `<th>${inline(c)}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`;
      }
      return `<p>${inline(b).replace(/\n/g, "<br />")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
  return html;
}

const stripTags = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export function PostEditor({
  post,
  interlinks = [],
  options: initialOptions,
}: {
  post?: BlogPost;
  interlinks?: InterlinkCandidate[];
  options?: EditorOptions;
}) {
  const router = useRouter();
  const editing = Boolean(post?.id);
  const [options, setOptions] = useState<EditorOptions>({ ...DEFAULT_EDITOR_OPTIONS, ...initialOptions });

  const [form, setForm] = useState<Draft>({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: mdToHtml(post?.content ?? ""),
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
    featured_image: post?.featured_image ?? "",
    access_type: post?.access_type ?? "free",
    layout: post?.layout ?? "full",
    custom_css: post?.custom_css ?? "",
    custom_schema: post?.custom_schema ?? "",
  });
  const [htmlMode, setHtmlMode] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [uploading, setUploading] = useState<"cover" | "avatar" | "inline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const inlineRef = useRef<HTMLInputElement>(null);

  const set = useCallback((k: keyof Draft, v: unknown) => setForm((f) => ({ ...f, [k]: v })), []);

  /* ── editable dropdown option lists (shared across the whole editor) ── */
  async function saveOptions(next: EditorOptions) {
    setOptions(next);
    try {
      await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_content", key: "editor_options", value: next }),
      });
    } catch {
      // keep the in-memory list; persistence retries on the next change
    }
  }

  function addOption(listKey: keyof EditorOptions, formKey: keyof Draft) {
    const v = window.prompt("Add new option")?.trim();
    if (!v) return;
    const list = options[listKey];
    if (!list.includes(v)) saveOptions({ ...options, [listKey]: [...list, v] });
    set(formKey, v);
  }

  function removeOption(listKey: keyof EditorOptions, formKey: keyof Draft, current: string) {
    const list = options[listKey];
    if (list.length <= 1) return;
    if (!window.confirm(`Remove "${current}" from the list? Existing posts keep their value.`)) return;
    const next = list.filter((o) => o !== current);
    saveOptions({ ...options, [listKey]: next });
    set(formKey, next[0]);
  }

  // seed the editable area once (and when toggling back from HTML view)
  useEffect(() => {
    if (!htmlMode && editorRef.current && editorRef.current.innerHTML !== (form.content ?? "")) {
      editorRef.current.innerHTML = form.content ?? "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlMode]);
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = form.content ?? "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncFromEditor = () => {
    if (editorRef.current) set("content", editorRef.current.innerHTML);
  };

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    syncFromEditor();
  };

  /* ── uploads (all converted to WebP server-side) ── */
  async function readJson(res: Response): Promise<Record<string, unknown>> {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Server returned ${res.status}${res.status === 413 ? " — file too large" : ""}. Try again in a moment.`);
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await readJson(res);
    if (!res.ok) throw new Error(String(json.error || "Upload failed"));
    return String(json.url);
  }

  async function handleUpload(kind: "cover" | "avatar" | "inline", file?: File | null) {
    if (!file) return;
    setUploading(kind);
    setError(null);
    try {
      const url = await uploadImage(file);
      if (kind === "cover") set("featured_image", url);
      else if (kind === "avatar") set("author_avatar", url);
      else exec("insertHTML", `<img src="${url}" alt="" />`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  /* ── interlink suggestions ── */
  const suggestions = useMemo(() => {
    const html = form.content ?? "";
    const plain = stripTags(html).toLowerCase();
    if (plain.length < 40) return [];
    return interlinks
      .filter((c) => {
        const phrase = c.phrase.toLowerCase();
        return (
          phrase.length >= 4 &&
          plain.includes(phrase) &&
          !html.toLowerCase().includes(`href="${c.href.toLowerCase()}`) &&
          c.href !== `/blog/${form.slug}`
        );
      })
      .slice(0, 6);
  }, [form.content, form.slug, interlinks]);

  function applyInterlink(c: InterlinkCandidate) {
    const root = editorRef.current;
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const phrase = c.phrase.toLowerCase();
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (node.parentElement?.closest("a")) continue;
      const idx = node.textContent?.toLowerCase().indexOf(phrase) ?? -1;
      if (idx === -1) continue;
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + c.phrase.length);
      const a = document.createElement("a");
      a.href = c.href;
      range.surroundContents(a);
      syncFromEditor();
      return;
    }
  }

  /* ── save ── */
  async function save(status: "draft" | "published") {
    setSaving(status === "draft" ? "draft" : "publish");
    setError(null);
    const html = htmlMode ? (form.content ?? "") : (editorRef.current?.innerHTML ?? form.content ?? "");
    const words = stripTags(html).split(" ").filter(Boolean).length;
    const payload = {
      ...form,
      content: html,
      id: post?.id,
      status,
      slug: form.slug?.trim() || slugify(form.title || ""),
      excerpt: (form.excerpt || form.meta_description || stripTags(html).slice(0, 158)).trim(),
      tags: (form.tagsInput || "").split(",").map((t) => t.trim()).filter(Boolean),
      read_time: Math.max(1, Math.round(words / 200)),
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
      setSaving(null);
    }
  }

  /* ── ui bits ── */
  const field =
    "w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold/50 focus:outline-none";
  const cardCls = "rounded-2xl border border-foreground/8 bg-card p-5";
  const cardTitle = "mb-3 text-sm font-semibold text-foreground";

  const ToolBtn = ({
    onClick,
    title,
    children,
    active = false,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-foreground/65 transition-colors hover:bg-foreground/8 hover:text-foreground ${
        active ? "bg-emerald-500/15 text-emerald-600" : ""
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="mx-0.5 h-5 w-px shrink-0 bg-foreground/10" />;

  /** Select with admin-editable options: ＋ adds a new entry, 🗑 removes the selected one. */
  const EditableSelect = ({
    listKey,
    formKey,
    value,
  }: {
    listKey: keyof EditorOptions;
    formKey: keyof Draft;
    value: string;
  }) => {
    const list = options[listKey];
    const merged = list.includes(value) || !value ? list : [value, ...list];
    return (
      <div className="flex items-center gap-1.5">
        <select className={field} value={value} onChange={(e) => set(formKey, e.target.value)}>
          {merged.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => addOption(listKey, formKey)}
          title="Add new option"
          className="grid h-[42px] w-9 shrink-0 place-items-center rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-base font-bold text-emerald-600 hover:bg-emerald-500/15"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => removeOption(listKey, formKey, value)}
          disabled={list.length <= 1}
          title="Remove selected option"
          className="grid h-[42px] w-9 shrink-0 place-items-center rounded-xl border border-red-400/30 bg-red-500/8 text-sm text-red-500 hover:bg-red-500/15 disabled:opacity-40"
        >
          ✕
        </button>
      </div>
    );
  };

  const TABLE_HTML =
    "<table><thead><tr><th>Heading</th><th>Heading</th><th>Heading</th></tr></thead><tbody><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr></tbody></table><p><br/></p>";

  const seg = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
      active ? "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30" : "text-foreground/55 hover:bg-foreground/5"
    }`;

  return (
    <div className="mx-auto max-w-[1240px]">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="grid h-9 w-9 place-items-center rounded-full text-foreground/55 hover:bg-foreground/5" aria-label="All pages">
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{editing ? "Edit Page" : "New Page"}</h1>
            <p className="text-sm text-foreground/55">{editing ? "Update your article" : "Create a new article"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save("draft")}
            disabled={saving !== null || !form.title}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-foreground/12 px-5 text-sm font-semibold text-foreground/75 hover:bg-foreground/5 disabled:opacity-50"
          >
            {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving !== null || !form.title}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-gradient px-6 text-sm font-semibold text-ink-950 disabled:opacity-50"
          >
            {saving === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Publish
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ══ main column ══ */}
        <div className="min-w-0 space-y-5">
          {/* Title */}
          <div className={cardCls}>
            <p className={cardTitle}>Title</p>
            <input
              className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-lg font-semibold text-foreground placeholder:font-normal placeholder:text-foreground/35 focus:border-gold/50 focus:outline-none"
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!editing) set("slug", slugify(e.target.value));
              }}
              placeholder="Enter article title…"
            />
          </div>

          {/* Permalink */}
          <div className={cardCls}>
            <p className={cardTitle}>Permalink</p>
            <div className="flex items-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5">
              <span className="shrink-0 border-r border-foreground/10 px-3.5 py-2.5 text-sm text-foreground/45">
                {new URL(siteConfig.url).hostname}/blog/
              </span>
              <input
                className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground focus:outline-none"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="article-slug"
              />
            </div>
          </div>

          {/* Featured image */}
          <div className={cardCls}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Featured Image</p>
              <p className="text-xs text-foreground/40">
                Recommended: <strong className="text-foreground/60">1200×630px</strong> (1.91:1) · JPG / PNG / WEBP
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className={field}
                value={form.featured_image ?? ""}
                onChange={(e) => set("featured_image", e.target.value)}
                placeholder="/image-filename.webp or https://…"
              />
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("cover", e.target.files?.[0])} />
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                disabled={uploading === "cover"}
                className="inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-600 hover:bg-emerald-500/15 disabled:opacity-60"
              >
                {uploading === "cover" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
              </button>
            </div>
            {form.featured_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.featured_image} alt="Featured preview" className="mt-3 h-40 w-full rounded-xl object-cover" />
            )}
            <p className="mt-2 text-xs text-foreground/40">Empty = the bundled cover art for this slug.</p>
          </div>

          {/* Content */}
          <div className={cardCls}>
            <p className={cardTitle}>Content</p>
            {/* toolbar */}
            <div className="mb-2 flex flex-wrap items-center gap-0.5 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-1.5">
              <ToolBtn title="Undo" onClick={() => exec("undo")}>
                <Undo2 className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Redo" onClick={() => exec("redo")}>
                <Redo2 className="h-4 w-4" />
              </ToolBtn>
              <Divider />
              <ToolBtn title="Heading 2" onClick={() => exec("formatBlock", "h2")}>
                <span className="text-xs font-bold">H2</span>
              </ToolBtn>
              <ToolBtn title="Heading 3" onClick={() => exec("formatBlock", "h3")}>
                <span className="text-xs font-bold">H3</span>
              </ToolBtn>
              <ToolBtn title="Heading 4" onClick={() => exec("formatBlock", "h4")}>
                <span className="text-xs font-bold">H4</span>
              </ToolBtn>
              <ToolBtn title="Paragraph" onClick={() => exec("formatBlock", "p")}>
                <Pilcrow className="h-4 w-4" />
              </ToolBtn>
              <Divider />
              <ToolBtn title="Bold" onClick={() => exec("bold")}>
                <Bold className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Italic" onClick={() => exec("italic")}>
                <Italic className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Underline" onClick={() => exec("underline")}>
                <Underline className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Strikethrough" onClick={() => exec("strikeThrough")}>
                <Strikethrough className="h-4 w-4" />
              </ToolBtn>
              <Divider />
              <ToolBtn title="Bullet list" onClick={() => exec("insertUnorderedList")}>
                <List className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Numbered list" onClick={() => exec("insertOrderedList")}>
                <ListOrdered className="h-4 w-4" />
              </ToolBtn>
              <Divider />
              <ToolBtn title="Align left" onClick={() => exec("justifyLeft")}>
                <AlignLeft className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Align centre" onClick={() => exec("justifyCenter")}>
                <AlignCenter className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Align right" onClick={() => exec("justifyRight")}>
                <AlignRight className="h-4 w-4" />
              </ToolBtn>
              <Divider />
              <ToolBtn title="Blockquote" onClick={() => exec("formatBlock", "blockquote")}>
                <Quote className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Code block" onClick={() => exec("formatBlock", "pre")}>
                <Code className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Divider" onClick={() => exec("insertHorizontalRule")}>
                <Minus className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Insert table" onClick={() => exec("insertHTML", TABLE_HTML)}>
                <Table className="h-4 w-4" />
              </ToolBtn>
              <Divider />
              <ToolBtn
                title="Insert link"
                onClick={() => {
                  const url = window.prompt("Link URL");
                  if (url) exec("createLink", url);
                }}
              >
                <Link2 className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn
                title="Image by URL"
                onClick={() => {
                  const url = window.prompt("Image URL");
                  if (url) exec("insertHTML", `<img src="${url}" alt="" />`);
                }}
              >
                <ImagePlus className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn title="Upload image" onClick={() => inlineRef.current?.click()}>
                {uploading === "inline" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </ToolBtn>
              <input ref={inlineRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("inline", e.target.files?.[0])} />
              <span className="ml-auto" />
              <button
                type="button"
                onClick={() => {
                  if (!htmlMode && editorRef.current) set("content", editorRef.current.innerHTML);
                  setHtmlMode((m) => !m);
                }}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${
                  htmlMode ? "bg-emerald-500/15 text-emerald-600" : "text-foreground/60 hover:bg-foreground/8"
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5" /> HTML
              </button>
            </div>

            {htmlMode ? (
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                spellCheck={false}
                className="min-h-[480px] w-full rounded-xl border border-foreground/10 bg-foreground/5 p-4 font-mono text-xs leading-relaxed text-foreground focus:border-gold/50 focus:outline-none"
              />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncFromEditor}
                onBlur={syncFromEditor}
                className="prose-spider prose min-h-[480px] w-full max-w-none rounded-xl border border-foreground/10 bg-foreground/[0.02] p-5 text-[15px] leading-relaxed text-foreground focus:border-gold/50 focus:outline-none dark:prose-invert prose-headings:font-display"
              />
            )}
          </div>
        </div>

        {/* ══ sidebar ══ */}
        <div className="space-y-5">
          {/* Status */}
          <div className={cardCls}>
            <p className={cardTitle}>Status</p>
            <p className="text-xs leading-relaxed text-foreground/55">
              Use <strong className="text-foreground/75">Save Draft</strong> to save without publishing, or{" "}
              <strong className="text-emerald-600">Publish</strong> to make it live immediately.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                checked={form.is_featured ?? false}
                onChange={(e) => set("is_featured", e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
              Feature on homepage
            </label>
          </div>

          {/* Sitewide / layout */}
          <div className={cardCls}>
            <p className={cardTitle}>Sitewide</p>
            <div className="flex gap-1 rounded-xl border border-foreground/10 p-1">
              <button type="button" onClick={() => set("layout", "full")} className={seg(form.layout === "full")}>
                Full Page
              </button>
              <button type="button" onClick={() => set("layout", "sidebar")} className={seg(form.layout === "sidebar")}>
                With Sidebar
              </button>
            </div>
          </div>

          {/* Interlink checker */}
          <div className={cardCls}>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Link2 className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Interlink Checker
            </p>
            {suggestions.length === 0 ? (
              <p className="text-xs text-foreground/45">Start writing to see interlink suggestions.</p>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((s) => (
                  <li key={s.href} className="flex items-center justify-between gap-2 rounded-lg bg-foreground/[0.03] px-2.5 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-foreground">{s.phrase}</span>
                      <span className="block truncate text-[10px] text-foreground/40">{s.href}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => applyInterlink(s)}
                      className="shrink-0 rounded-md bg-emerald-500/12 px-2 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-500/20"
                    >
                      Link
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* SEO settings */}
          <div className={cardCls}>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Search className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> SEO Settings
            </p>
            <label className="mb-1 block text-xs font-medium text-foreground/55">Meta Title</label>
            <input className={field} value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} placeholder="Custom title for search engines…" />
            <p className={`mt-1 text-[11px] ${(form.meta_title?.length ?? 0) > 60 ? "text-red-500" : "text-foreground/40"}`}>
              {form.meta_title?.length ?? 0}/60 characters
            </p>
            <label className="mb-1 mt-3 block text-xs font-medium text-foreground/55">Meta Description</label>
            <textarea
              rows={3}
              className={field}
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              placeholder="Brief description for Google search results (max 155 chars)…"
            />
            <p className={`mt-1 text-[11px] ${(form.meta_description?.length ?? 0) > 155 ? "text-red-500" : "text-foreground/40"}`}>
              {form.meta_description?.length ?? 0}/155 characters
            </p>
            <label className="mb-1 mt-3 block text-xs font-medium text-foreground/55">Excerpt (card preview)</label>
            <textarea rows={2} className={field} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Defaults to the meta description" />
            <label className="mb-1 mt-3 block text-xs font-medium text-foreground/55">Tags (comma separated)</label>
            <input className={field} value={form.tagsInput} onChange={(e) => set("tagsInput", e.target.value)} placeholder="identification, safety" />
          </div>

          {/* Author */}
          <div className={cardCls}>
            <p className={cardTitle}>Author</p>
            <label className="mb-1 block text-xs font-medium text-foreground/55">Name</label>
            <input className={field} value={form.author_name} onChange={(e) => set("author_name", e.target.value)} />
            <label className="mb-1 mt-3 block text-xs font-medium text-foreground/55">Role</label>
            <input className={field} value={form.author_role} onChange={(e) => set("author_role", e.target.value)} />
            <label className="mb-1 mt-3 block text-xs font-medium text-foreground/55">Photo</label>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.author_avatar || "/images/authors/default-avatar.svg"}
                alt="Author"
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-foreground/10"
              />
              <input className={field} value={form.author_avatar ?? ""} onChange={(e) => set("author_avatar", e.target.value)} placeholder="Photo URL" />
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("avatar", e.target.files?.[0])} />
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={uploading === "avatar"}
                title="Upload photo"
                className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-foreground/12 text-foreground/60 hover:bg-foreground/5 disabled:opacity-60"
              >
                {uploading === "avatar" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Category */}
          <div className={cardCls}>
            <p className={cardTitle}>Category</p>
            <EditableSelect listKey="categories" formKey="category" value={form.category ?? ""} />
            <label className="mb-1 mt-3 block text-xs font-medium text-foreground/55">Cover accent</label>
            <EditableSelect listKey="cover_accents" formKey="cover_accent" value={form.cover_accent ?? "gold"} />
          </div>

          {/* Access type */}
          <div className={cardCls}>
            <p className={cardTitle}>Access Type</p>
            <div className="flex gap-1 rounded-xl border border-foreground/10 p-1">
              <button type="button" onClick={() => set("access_type", "free")} className={seg(form.access_type === "free")}>
                🌐 Free
              </button>
              <button type="button" onClick={() => set("access_type", "premium")} className={seg(form.access_type === "premium")}>
                🔒 Premium
              </button>
            </div>
            {form.access_type === "premium" && (
              <p className="mt-2 text-[11px] text-foreground/45">Readers without a paid plan see a locked preview with an upgrade prompt.</p>
            )}
          </div>

          {/* Level */}
          <div className={cardCls}>
            <p className={cardTitle}>Level</p>
            <EditableSelect listKey="levels" formKey="level" value={form.level ?? "Beginner"} />
          </div>

          {/* Region */}
          <div className={cardCls}>
            <p className={cardTitle}>Region</p>
            <EditableSelect listKey="regions" formKey="region" value={form.region ?? "Worldwide"} />
          </div>

          {/* Custom CSS */}
          <div className={cardCls}>
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Code className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Custom CSS
            </p>
            <p className="mb-2 text-[11px] text-foreground/45">Only loads on this page. Loaded after global CSS so your rules win.</p>
            <textarea
              rows={5}
              spellCheck={false}
              className={field + " font-mono text-xs"}
              value={form.custom_css ?? ""}
              onChange={(e) => set("custom_css", e.target.value)}
              placeholder={"/* Example */\n.prose-spider h2 {\n  color: #10b981;\n}"}
            />
          </div>

          {/* Custom Schema */}
          <div className={cardCls}>
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileCode2 className="h-4 w-4 text-[rgb(var(--gold-soft))]" /> Custom Schema (JSON-LD)
            </p>
            <p className="mb-2 text-[11px] text-foreground/45">
              Only loads on this page. If set, <strong>replaces</strong> the default Article schema. Use for HowTo, FAQPage, Recipe, Product, etc.
            </p>
            <textarea
              rows={7}
              spellCheck={false}
              className={field + " font-mono text-xs"}
              value={form.custom_schema ?? ""}
              onChange={(e) => set("custom_schema", e.target.value)}
              placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": []\n}'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
