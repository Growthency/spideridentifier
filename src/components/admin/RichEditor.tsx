"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Heading4,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Minus,
  Upload,
  Undo2,
  Redo2,
  Pilcrow,
  Table,
  Trash2,
  X,
  GripVertical,
  Pencil,
  Unlink,
  ExternalLink,
  FileCode2,
  Eye,
  Captions,
} from "lucide-react";
import { dialogPrompt, dialogAlert } from "@/components/ui/Dialog";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  /**
   * When this changes, the contentEditable DOM is re-seeded from `value`
   * so external updates (e.g. applying an interlink suggestion) actually
   * show up in the editor. Without this, `value` changes are ignored after
   * the first mount because the MutationObserver only syncs DOM → parent.
   * Bump this counter whenever you mutate `value` from outside the editor.
   */
  resetKey?: number | string;
  /** Upload endpoint that returns `{ url }`. Defaults to /api/upload. */
  uploadEndpoint?: string;
}

const IMG_STYLE = "max-width:100%;height:auto;border-radius:10px;margin:16px 0;";
const FIGCAPTION_STYLE = "text-align:center;font-size:0.85em;opacity:0.7;margin-top:6px;font-style:italic;";

export default function RichEditor({ value, onChange, resetKey, uploadEndpoint = "/api/upload" }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const onChangeRef = useRef(onChange);
  const initializedRef = useRef(false);
  const savedSelectionRef = useRef<Range | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // WordPress-style Visual ⇄ HTML toggle — lets admins paste full custom-page
  // HTML or tweak the raw markup directly.
  const [viewMode, setViewMode] = useState<"visual" | "html">("visual");

  // Image selection state
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgAlt, setImgAlt] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [imgToolbarPos, setImgToolbarPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  // Link selection state
  const [selectedLink, setSelectedLink] = useState<HTMLAnchorElement | null>(null);
  const [linkToolbarPos, setLinkToolbarPos] = useState<{ top: number; left: number } | null>(null);

  // Keep callback ref fresh without re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Seed initial content only once (and re-init when coming back from HTML view
  // so the edited raw markup gets re-mounted into the contentEditable DOM).
  useEffect(() => {
    if (viewMode !== "visual") return;
    if (editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = value ?? "";
      initializedRef.current = true;
    }
  }, [value, viewMode]);

  // Force re-sync value → live DOM whenever resetKey changes. Used by external
  // features that mutate content and expect the editor to reflect it (e.g. the
  // Interlink Checker). Skips the very first render — the init effect above
  // already seeded the DOM.
  useEffect(() => {
    if (resetKey === undefined) return;
    if (viewMode !== "visual") return;
    if (!editorRef.current || !initializedRef.current) return;
    editorRef.current.innerHTML = value ?? "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // MutationObserver to catch ALL DOM changes and sync to parent. Re-hooks
  // whenever we re-enter visual mode (the contentEditable div is conditionally
  // shown, so the ref points at a fresh node after a toggle).
  useEffect(() => {
    if (viewMode !== "visual") return;
    const editor = editorRef.current;
    if (!editor) return;
    const observer = new MutationObserver(() => {
      onChangeRef.current(editor.innerHTML);
    });
    observer.observe(editor, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [viewMode]);

  // Toggle between Visual (contentEditable) and HTML (textarea) modes.
  const toggleViewMode = useCallback(() => {
    if (viewMode === "visual") {
      if (editorRef.current) onChangeRef.current(editorRef.current.innerHTML);
      setViewMode("html");
    } else {
      initializedRef.current = false;
      setViewMode("visual");
    }
  }, [viewMode]);

  const syncContent = useCallback(() => {
    if (editorRef.current) onChangeRef.current(editorRef.current.innerHTML);
  }, []);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  }, []);

  // Detect active formatting at cursor position (for toolbar highlighting)
  const detectFormats = useCallback(() => {
    const formats = new Set<string>();
    try {
      if (document.queryCommandState("bold")) formats.add("bold");
      if (document.queryCommandState("italic")) formats.add("italic");
      if (document.queryCommandState("underline")) formats.add("underline");
      if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough");
      if (document.queryCommandState("insertUnorderedList")) formats.add("insertUnorderedList");
      if (document.queryCommandState("insertOrderedList")) formats.add("insertOrderedList");
      const block = document.queryCommandValue("formatBlock");
      if (block) formats.add(block.toLowerCase());
    } catch {
      /* queryCommand* can throw if the editor isn't focused — ignore */
    }
    setActiveFormats(formats);
  }, []);

  const exec = useCallback(
    (command: string, val?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, val);
      syncContent();
      detectFormats();
    },
    [syncContent, detectFormats]
  );

  const handleInput = useCallback(() => {
    syncContent();
    detectFormats();
  }, [syncContent, detectFormats]);

  // ── Image toolbar positioning ──
  const positionImgToolbar = useCallback((img: HTMLImageElement) => {
    const editorRect = editorRef.current?.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    if (editorRect && editorRef.current) {
      setImgToolbarPos({
        top: imgRect.top - editorRect.top + editorRef.current.scrollTop,
        left: imgRect.left - editorRect.left,
        width: imgRect.width,
      });
    }
  }, []);

  // ── Image alignment ──
  const alignImage = useCallback(
    (alignment: "left" | "center" | "right") => {
      if (!selectedImg) return;
      let parent = selectedImg.parentElement;
      // Wrap a bare image (or its <figure>) in an alignment block.
      const block = selectedImg.closest("figure") ?? selectedImg;
      if (block.parentElement === editorRef.current) {
        const wrapper = document.createElement("div");
        block.parentNode?.insertBefore(wrapper, block);
        wrapper.appendChild(block);
        parent = wrapper;
      } else {
        parent = block.parentElement;
      }
      if (parent && parent !== editorRef.current) {
        parent.style.textAlign = alignment;
        selectedImg.style.display = "block";
        if (alignment === "center") {
          selectedImg.style.marginLeft = "auto";
          selectedImg.style.marginRight = "auto";
        } else if (alignment === "right") {
          selectedImg.style.marginLeft = "auto";
          selectedImg.style.marginRight = "0";
        } else {
          selectedImg.style.marginLeft = "0";
          selectedImg.style.marginRight = "auto";
        }
      }
      requestAnimationFrame(() => positionImgToolbar(selectedImg));
      syncContent();
    },
    [selectedImg, syncContent, positionImgToolbar]
  );

  // ── Image selection ──
  const selectImage = useCallback(
    (img: HTMLImageElement) => {
      setSelectedImg(img);
      setImgAlt(img.getAttribute("alt") || "");
      setImgCaption(img.closest("figure")?.querySelector("figcaption")?.textContent || "");
      positionImgToolbar(img);
      img.style.outline = "3px solid #34d399";
      img.style.outlineOffset = "2px";
      img.style.cursor = "move";
    },
    [positionImgToolbar]
  );

  const deselectImage = useCallback(() => {
    if (selectedImg) {
      selectedImg.style.outline = "";
      selectedImg.style.outlineOffset = "";
      selectedImg.style.cursor = "";
    }
    setSelectedImg(null);
    setImgToolbarPos(null);
  }, [selectedImg]);

  const deleteSelectedImage = useCallback(() => {
    if (!selectedImg) return;
    // Remove the wrapping <figure> too, if any.
    (selectedImg.closest("figure") ?? selectedImg).remove();
    deselectImage();
    syncContent();
  }, [selectedImg, deselectImage, syncContent]);

  const updateImgAlt = useCallback(
    (newAlt: string) => {
      setImgAlt(newAlt);
      if (selectedImg) {
        selectedImg.setAttribute("alt", newAlt);
        syncContent();
      }
    },
    [selectedImg, syncContent]
  );

  // ── Caption: wrap the image in <figure><figcaption> (created/updated/removed) ──
  const updateImgCaption = useCallback(
    (text: string) => {
      setImgCaption(text);
      if (!selectedImg) return;
      let fig = selectedImg.closest("figure");
      const trimmed = text.trim();
      if (trimmed) {
        if (!fig) {
          fig = document.createElement("figure");
          fig.setAttribute("style", "margin:16px 0;");
          selectedImg.parentNode?.insertBefore(fig, selectedImg);
          fig.appendChild(selectedImg);
        }
        let cap = fig.querySelector("figcaption");
        if (!cap) {
          cap = document.createElement("figcaption");
          cap.setAttribute("style", FIGCAPTION_STYLE);
          fig.appendChild(cap);
        }
        cap.textContent = trimmed;
      } else if (fig) {
        // Caption cleared → unwrap the figure, keep the image in place.
        fig.querySelector("figcaption")?.remove();
        fig.parentNode?.insertBefore(selectedImg, fig);
        fig.remove();
      }
      requestAnimationFrame(() => selectedImg && positionImgToolbar(selectedImg));
      syncContent();
    },
    [selectedImg, syncContent, positionImgToolbar]
  );

  // ── Link selection ──
  const deselectLink = useCallback(() => {
    setSelectedLink(null);
    setLinkToolbarPos(null);
  }, []);

  const selectLink = useCallback((link: HTMLAnchorElement) => {
    setSelectedLink(link);
    const editorRect = editorRef.current?.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    if (editorRect && editorRef.current) {
      setLinkToolbarPos({
        top: linkRect.bottom - editorRect.top + editorRef.current.scrollTop + 4,
        left: Math.max(0, linkRect.left - editorRect.left),
      });
    }
  }, []);

  const editSelectedLink = useCallback(async () => {
    if (!selectedLink) return;
    const newUrl = await dialogPrompt("Edit link URL", selectedLink.getAttribute("href") || "");
    if (newUrl) {
      selectedLink.setAttribute("href", newUrl);
      syncContent();
    }
    deselectLink();
  }, [selectedLink, syncContent, deselectLink]);

  const removeSelectedLink = useCallback(() => {
    if (!selectedLink) return;
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(selectedLink);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("unlink", false);
    }
    syncContent();
    deselectLink();
  }, [selectedLink, syncContent, deselectLink]);

  const openSelectedLink = useCallback(() => {
    const href = selectedLink?.getAttribute("href");
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }, [selectedLink]);

  // Click inside editor — select image / link, or deselect
  const handleEditorClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
        e.stopPropagation();
        deselectImage();
        deselectLink();
        selectImage(target as HTMLImageElement);
      } else {
        deselectImage();
        const link = target.closest("a") as HTMLAnchorElement | null;
        if (link && editorRef.current?.contains(link)) {
          e.preventDefault();
          deselectLink();
          selectLink(link);
        } else {
          deselectLink();
        }
      }
      detectFormats();
    },
    [selectImage, deselectImage, selectLink, deselectLink, detectFormats]
  );

  // Keyboard: Delete/Backspace removes selected image; Esc deselects
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (selectedImg && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault();
        deleteSelectedImage();
      } else if (selectedImg && e.key === "Escape") {
        deselectImage();
      } else if (selectedLink && e.key === "Escape") {
        deselectLink();
      }
    },
    [selectedImg, deleteSelectedImage, deselectImage, selectedLink, deselectLink]
  );

  // Drag-to-resize the selected image
  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedImg) return;
      resizeStartRef.current = { x: e.clientX, width: selectedImg.offsetWidth };

      const onMouseMove = (ev: MouseEvent) => {
        if (!resizeStartRef.current || !selectedImg) return;
        const diff = ev.clientX - resizeStartRef.current.x;
        const newWidth = Math.max(80, resizeStartRef.current.width + diff);
        selectedImg.style.width = `${newWidth}px`;
        selectedImg.style.height = "auto";
        positionImgToolbar(selectedImg);
      };
      const onMouseUp = () => {
        resizeStartRef.current = null;
        syncContent();
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [selectedImg, syncContent, positionImgToolbar]
  );

  // Click outside the editor deselects image & link (but not the floating toolbars)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        const imgToolbar = document.getElementById("img-toolbar");
        if (imgToolbar?.contains(e.target as Node)) return;
        const lnkToolbar = document.getElementById("link-toolbar");
        if (lnkToolbar?.contains(e.target as Node)) return;
        deselectImage();
        deselectLink();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [deselectImage, deselectLink]);

  // Heading / block toggles
  const toggleBlock = (tag: string) => {
    const current = (() => {
      try {
        return document.queryCommandValue("formatBlock").toLowerCase();
      } catch {
        return "";
      }
    })();
    exec("formatBlock", current === tag ? "p" : tag);
  };

  // Alignment routes to the image when one is selected, else the text caret
  const handleAlign = useCallback(
    (alignment: "left" | "center" | "right") => {
      if (selectedImg) {
        alignImage(alignment);
      } else {
        exec(alignment === "left" ? "justifyLeft" : alignment === "center" ? "justifyCenter" : "justifyRight");
      }
    },
    [selectedImg, alignImage, exec]
  );

  const insertLink = async () => {
    const url = await dialogPrompt("Link URL", "https://");
    if (url) {
      editorRef.current?.focus();
      restoreSelection();
      exec("createLink", url);
    }
  };

  const insertImageUrl = async () => {
    const url = await dialogPrompt("Image URL", "https://");
    if (!url) return;
    const alt = (await dialogPrompt("Alt text (for SEO & accessibility)", "")) || "Article image";
    editorRef.current?.focus();
    restoreSelection();
    exec("insertHTML", `<img src="${url}" alt="${alt.replace(/"/g, "&quot;")}" style="${IMG_STYLE}" /><p><br></p>`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const suggested = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    const alt = (await dialogPrompt("Image alt text (for SEO & accessibility)", suggested)) || suggested;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(uploadEndpoint, { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      const imgHtml = `<img src="${data.url}" alt="${alt.replace(/"/g, "&quot;")}" style="${IMG_STYLE}" /><p><br></p>`;
      editorRef.current?.focus();
      restoreSelection();
      const ok = document.execCommand("insertHTML", false, imgHtml);
      if (!ok && editorRef.current) editorRef.current.innerHTML += imgHtml;
      syncContent();
    } catch (err) {
      await dialogAlert(err instanceof Error ? err.message : "Upload failed", "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertHR = () => exec("insertHTML", `<hr style="border:none;border-top:1px solid rgb(var(--foreground)/0.12);margin:24px 0;" />`);

  const insertTable = async () => {
    const rowsStr = await dialogPrompt("Number of rows", "3");
    if (!rowsStr) return;
    const colsStr = await dialogPrompt("Number of columns", "3");
    if (!colsStr) return;
    const r = Math.max(1, parseInt(rowsStr, 10) || 3);
    const c = Math.max(1, parseInt(colsStr, 10) || 3);
    let html = '<table style="width:100%;border-collapse:collapse;margin:16px 0;"><thead><tr>';
    for (let j = 0; j < c; j++) html += '<th style="border:1px solid rgb(var(--foreground)/0.15);padding:8px 12px;text-align:left;font-weight:600;">Header</th>';
    html += "</tr></thead><tbody>";
    for (let i = 0; i < r - 1; i++) {
      html += "<tr>";
      for (let j = 0; j < c; j++) html += '<td style="border:1px solid rgb(var(--foreground)/0.15);padding:8px 12px;">Cell</td>';
      html += "</tr>";
    }
    html += "</tbody></table><p><br></p>";
    editorRef.current?.focus();
    restoreSelection();
    exec("insertHTML", html);
  };

  const isActive = (fmt: string) => activeFormats.has(fmt);

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
      onMouseDown={(e) => {
        e.preventDefault();
        saveSelection();
        onClick();
      }}
      title={title}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-foreground/8 hover:text-foreground ${
        active ? "bg-emerald-500/15 text-emerald-600" : "text-foreground/65"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="mx-0.5 h-5 w-px shrink-0 bg-foreground/10" />;

  return (
    <div className="relative max-h-[72vh] overflow-y-auto rounded-xl border border-foreground/10 bg-foreground/[0.02]">
      {/* ── Sticky toolbar ── */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 border-b border-foreground/10 bg-card/95 p-1.5 backdrop-blur">
        {/* Formatting controls dim + become inert in HTML mode. */}
        <div className={`flex flex-wrap items-center gap-0.5 ${viewMode === "html" ? "pointer-events-none opacity-40" : ""}`}>
          <ToolBtn title="Undo" onClick={() => exec("undo")}>
            <Undo2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Redo" onClick={() => exec("redo")}>
            <Redo2 className="h-4 w-4" />
          </ToolBtn>
          <Divider />
          <ToolBtn title="Heading 2" onClick={() => toggleBlock("h2")} active={isActive("h2")}>
            <Heading2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Heading 3" onClick={() => toggleBlock("h3")} active={isActive("h3")}>
            <Heading3 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Heading 4" onClick={() => toggleBlock("h4")} active={isActive("h4")}>
            <Heading4 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Paragraph" onClick={() => exec("formatBlock", "p")} active={isActive("p")}>
            <Pilcrow className="h-4 w-4" />
          </ToolBtn>
          <Divider />
          <ToolBtn title="Bold" onClick={() => exec("bold")} active={isActive("bold")}>
            <Bold className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Italic" onClick={() => exec("italic")} active={isActive("italic")}>
            <Italic className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Underline" onClick={() => exec("underline")} active={isActive("underline")}>
            <Underline className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Strikethrough" onClick={() => exec("strikeThrough")} active={isActive("strikeThrough")}>
            <Strikethrough className="h-4 w-4" />
          </ToolBtn>
          <Divider />
          <ToolBtn title="Bullet list" onClick={() => exec("insertUnorderedList")} active={isActive("insertUnorderedList")}>
            <List className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Numbered list" onClick={() => exec("insertOrderedList")} active={isActive("insertOrderedList")}>
            <ListOrdered className="h-4 w-4" />
          </ToolBtn>
          <Divider />
          <ToolBtn title="Align left" onClick={() => handleAlign("left")}>
            <AlignLeft className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Align centre" onClick={() => handleAlign("center")}>
            <AlignCenter className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Align right" onClick={() => handleAlign("right")}>
            <AlignRight className="h-4 w-4" />
          </ToolBtn>
          <Divider />
          <ToolBtn title="Blockquote" onClick={() => toggleBlock("blockquote")} active={isActive("blockquote")}>
            <Quote className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Code block" onClick={() => toggleBlock("pre")} active={isActive("pre")}>
            <Code className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Divider" onClick={insertHR}>
            <Minus className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Insert table" onClick={insertTable}>
            <Table className="h-4 w-4" />
          </ToolBtn>
          <Divider />
          <ToolBtn title="Insert link" onClick={insertLink}>
            <LinkIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Image by URL" onClick={insertImageUrl}>
            <ImageIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn title="Upload image" onClick={() => fileInputRef.current?.click()}>
            {uploading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </ToolBtn>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <span className="ml-auto" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleViewMode();
          }}
          title={viewMode === "visual" ? "Switch to HTML view" : "Switch to Visual view"}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
            viewMode === "html" ? "bg-emerald-500/15 text-emerald-600" : "text-foreground/60 hover:bg-foreground/8"
          }`}
        >
          {viewMode === "visual" ? (
            <>
              <FileCode2 className="h-3.5 w-3.5" /> HTML
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Visual
            </>
          )}
        </button>
      </div>

      {/* ── HTML raw view ── */}
      {viewMode === "html" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="min-h-[480px] w-full resize-y bg-transparent p-5 font-mono text-xs leading-relaxed text-foreground outline-none"
          placeholder="<!-- Paste or edit raw HTML here. Switch back to Visual to preview. -->"
        />
      )}

      {/* ── Visual editor (hidden, not unmounted, in HTML mode so refs stay alive) ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        hidden={viewMode === "html"}
        onInput={handleInput}
        onBlur={() => {
          saveSelection();
          syncContent();
        }}
        onKeyUp={detectFormats}
        onKeyDown={handleKeyDown}
        onMouseUp={detectFormats}
        onClick={handleEditorClick}
        className="prose-spider prose min-h-[480px] w-full max-w-none p-5 text-[15px] leading-relaxed text-foreground outline-none dark:prose-invert prose-headings:font-display [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:italic [&_figcaption]:text-foreground/55 [&_img]:cursor-pointer"
      />

      {/* ── Image toolbar (alt + caption + resize + delete) ── */}
      {selectedImg && imgToolbarPos && (
        <div
          id="img-toolbar"
          className="absolute z-30 flex flex-col gap-1.5"
          style={{ top: imgToolbarPos.top + 46, left: imgToolbarPos.left, width: Math.max(imgToolbarPos.width, 300) }}
          contentEditable={false}
        >
          <div
            className="flex flex-col gap-1.5 rounded-xl border border-foreground/12 bg-card/95 p-2 shadow-card backdrop-blur"
            style={{ marginTop: (selectedImg.offsetHeight || 0) - 8 }}
          >
            {/* Alt + actions row */}
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-[10px] font-bold uppercase text-emerald-600">Alt</span>
              <input
                type="text"
                value={imgAlt}
                onChange={(e) => updateImgAlt(e.target.value)}
                placeholder="Alt text for SEO…"
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 flex-1 rounded-lg border border-foreground/12 bg-foreground/5 px-2 py-1 text-xs text-foreground outline-none focus:border-emerald-500/50"
              />
              <button
                type="button"
                onMouseDown={startResize}
                title="Drag to resize"
                className="grid h-7 w-7 shrink-0 cursor-ew-resize place-items-center rounded-lg text-foreground/55 hover:bg-foreground/8 hover:text-foreground"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSelectedImage();
                }}
                title="Delete image (Backspace)"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-red-500 hover:bg-red-500/15"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deselectImage();
                }}
                title="Deselect (Esc)"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-foreground/45 hover:bg-foreground/8"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Caption row */}
            <div className="flex items-center gap-1.5">
              <Captions className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <input
                type="text"
                value={imgCaption}
                onChange={(e) => updateImgCaption(e.target.value)}
                placeholder="Caption (optional)…"
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 flex-1 rounded-lg border border-foreground/12 bg-foreground/5 px-2 py-1 text-xs text-foreground outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Link toolbar (edit / open / remove) ── */}
      {selectedLink && linkToolbarPos && (
        <div
          id="link-toolbar"
          className="absolute z-30"
          style={{ top: linkToolbarPos.top + 46, left: linkToolbarPos.left }}
          contentEditable={false}
        >
          <div className="flex items-center gap-1 rounded-xl border border-foreground/12 bg-card/95 px-2 py-1.5 shadow-card backdrop-blur">
            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="mx-1.5 max-w-[180px] truncate text-xs text-foreground/55" title={selectedLink.getAttribute("href") || ""}>
              {selectedLink.getAttribute("href") || "No URL"}
            </span>
            <span className="mx-0.5 h-4 w-px bg-foreground/10" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                editSelectedLink();
              }}
              title="Edit link URL"
              className="grid h-7 w-7 place-items-center rounded-lg text-foreground/55 hover:bg-foreground/8 hover:text-emerald-600"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSelectedLink();
              }}
              title="Open in new tab"
              className="grid h-7 w-7 place-items-center rounded-lg text-foreground/55 hover:bg-foreground/8 hover:text-emerald-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSelectedLink();
              }}
              title="Remove link (keep text)"
              className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-500/15"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deselectLink();
              }}
              title="Close"
              className="grid h-7 w-7 place-items-center rounded-lg text-foreground/45 hover:bg-foreground/8"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
