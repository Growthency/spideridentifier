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

/** Renders post markdown with GFM tables and heading anchors, themed for dark. */
export function Markdown({ content, linkRules = [] }: { content: string; linkRules?: ExternalLinkRule[] }) {
  return (
    <div className="prose-spider prose max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-table:text-sm">
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
