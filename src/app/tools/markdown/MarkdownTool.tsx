"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";

/**
 * Minimal Markdown to HTML converter. Handles:
 * headings, bold, italic, inline code, code blocks,
 * links, unordered lists, ordered lists, blockquotes,
 * horizontal rules, and paragraphs.
 *
 * No external dependencies — keeps the tool bundle tiny.
 */
function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre><code class="language-${lang || "text"}">${escaped}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

  // Paragraphs (lines that aren't already tags)
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<[a-z]/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
}

const PLACEHOLDER = `# Hello World

This is **bold** and *italic* text.

## Features

- Live preview
- Copy HTML output
- No external dependencies

\`\`\`javascript
const greeting = "Hello!";
console.log(greeting);
\`\`\`

> This is a blockquote.

[Visit GitHub](https://github.com)`;

export function MarkdownTool() {
  const [input, setInput] = useState(PLACEHOLDER);

  const html = useMemo(() => markdownToHtml(input), [input]);

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Write Markdown and see a live rendered preview. Copy the generated HTML."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
            Markdown
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            spellCheck={false}
            className="min-h-[16rem] resize-y rounded-xl border border-hairline bg-white/[0.03] p-4 font-mono text-[0.8125rem] leading-relaxed text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-electric-500/40"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
              Preview
            </span>
            <CopyButton value={html} label="HTML" />
          </div>
          <div
            className="prose-sm min-h-[16rem] overflow-auto rounded-xl border border-hairline bg-white/[0.02] p-4 text-[0.875rem] leading-relaxed text-ink [&_a]:text-electric-300 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-electric-500/30 [&_blockquote]:pl-3 [&_blockquote]:text-ink-muted [&_code]:rounded [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8125rem] [&_h1]:mb-3 [&_h1]:text-[1.5rem] [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-[1.25rem] [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-[1.125rem] [&_h3]:font-semibold [&_hr]:my-4 [&_hr]:border-hairline [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3 [&_pre]:my-3 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-white/[0.04] [&_pre]:p-3 [&_strong]:font-semibold [&_ul]:mb-3"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
