import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

/** Renders post markdown with GFM tables and heading anchors, themed for dark. */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-spider prose max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-table:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
