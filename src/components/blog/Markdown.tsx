import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { ExternalLinkRule } from "@/lib/siteContent";

/** rel value for an outbound link, honouring admin-managed domain rules. */
function relFor(href: string, rules: ExternalLinkRule[]): string {
  const rel = ["noopener", "noreferrer"];
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    const rule = rules.find((r) => host === r.domain || host.endsWith(`.${r.domain}`));
    if (rule?.nofollow) rel.push("nofollow");
    if (rule?.sponsored) rel.push("sponsored");
  } catch {
    // unparsable URL — default rel only
  }
  return rel.join(" ");
}

/** Posts written in the rich editor are stored as HTML. */
const looksLikeHtml = (s: string) => /<\/?(p|h[1-6]|ul|ol|div|img|table|blockquote|figure)\b/i.test(s.slice(0, 1000));

/** Add target/rel to external anchors + slug ids to h2/h3 in editor HTML. */
function decorateHtml(html: string, rules: ExternalLinkRule[]): string {
  let out = html.replace(/<a\s+([^>]*href="(https?:\/\/[^"]+)"[^>]*)>/gi, (match, attrs: string, href: string) => {
    if (/target=/i.test(attrs)) return match;
    return `<a ${attrs} target="_blank" rel="${relFor(href, rules)}">`;
  });
  out = out.replace(/<h([23])>([^<]*)<\/h\1>/gi, (_m, level: string, text: string) => {
    const id = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
  return out;
}

const PROSE =
  "prose-spider prose max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-table:text-sm prose-img:rounded-2xl";

/**
 * Article body renderer. Markdown posts go through react-markdown; rich
 * editor posts (stored as HTML) are decorated server-side and injected.
 */
export function Markdown({ content, linkRules = [] }: { content: string; linkRules?: ExternalLinkRule[] }) {
  if (looksLikeHtml(content)) {
    return <div className={PROSE} dangerouslySetInnerHTML={{ __html: decorateHtml(content, linkRules) }} />;
  }

  return (
    <div className={PROSE}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href = "", children, ...props }) => {
            const external = /^https?:\/\//i.test(href);
            return (
              <a href={href} {...props} {...(external ? { target: "_blank", rel: relFor(href, linkRules) } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
