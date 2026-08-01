"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Collapsible accordion for notes. Used as:
 *
 * ```mdx
 * <Accordion title="How does this work?">
 *   Explanation content...
 * </Accordion>
 * ```
 */
export function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-hairline overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[0.9375rem] font-medium text-ink transition-colors hover:bg-white/[0.03]"
      >
        {title}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-ink-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        >
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-hairline px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-muted [&>p]:mt-2 [&>p:first-child]:mt-0">
          {children}
        </div>
      )}
    </div>
  );
}
