"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Grouped code blocks with language tabs. Used as:
 *
 * ```mdx
 * <CodeGroup labels={["TypeScript", "Python", "Go"]}>
 *   ```ts
 *   const x = 1;
 *   ```
 *   ```python
 *   x = 1
 *   ```
 *   ```go
 *   x := 1
 *   ```
 * </CodeGroup>
 * ```
 */
export function CodeGroup({ labels, children }: { labels: string[]; children: ReactNode }) {
  const [active, setActive] = useState(0);
  const blocks = Array.isArray(children) ? children : [children];

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-hairline">
      <div className="flex overflow-x-auto border-b border-hairline bg-white/[0.02]" role="tablist">
        {labels.map((label, i) => (
          <button
            key={label}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 px-4 py-2 font-mono text-[0.75rem] font-medium transition-colors duration-200",
              i === active
                ? "border-b-2 border-electric-400 text-electric-200"
                : "text-ink-faint hover:text-ink-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="[&>pre]:mt-0 [&>pre]:rounded-none [&>pre]:border-0">
        {blocks[active]}
      </div>
    </div>
  );
}
