"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/notes";
import { cn } from "@/lib/utils";

/**
 * Sticky table of contents shown on desktop alongside the article.
 * Highlights the heading currently in view using IntersectionObserver.
 */
export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const elements = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (ioEntries) => {
        const visible = ioEntries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:sticky xl:top-32 xl:block xl:max-h-[calc(100svh-10rem)] xl:overflow-y-auto xl:pr-4"
    >
      <p className="mb-3 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase">
        On this page
      </p>
      <ul className="flex flex-col gap-1.5 border-l border-hairline">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={cn(
                "block border-l-2 py-1 text-[0.8125rem] leading-snug transition-all duration-200",
                entry.level === 3 ? "pl-6" : "pl-4",
                activeId === entry.id
                  ? "border-electric-400 text-electric-200"
                  : "border-transparent text-ink-faint hover:text-ink-muted",
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
