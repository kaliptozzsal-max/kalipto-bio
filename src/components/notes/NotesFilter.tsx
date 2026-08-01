"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRightIcon, ClockIcon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

/** Matches NoteSearchEntry from lib/notes — duplicated here to avoid importing the server module. */
type NoteEntry = {
  slug: string;
  title: string;
  summary: string;
  tags: readonly string[];
  category: string;
  date: string;
  readingMinutes: number;
};

/** Format date client-side — mirrors formatNoteDate but without node:fs dependency. */
function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Client-side search and filter for the notes index.
 * All notes are passed from the server; filtering is instant.
 */
export function NotesFilter({
  notes,
  categories,
  tags,
}: {
  notes: NoteEntry[];
  categories: string[];
  tags: string[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTag, setActiveTag] = useState("");

  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    let result = [...notes];

    if (activeCategory) {
      result = result.filter((n) => n.category === activeCategory);
    }
    if (activeTag) {
      result = result.filter((n) => n.tags.includes(activeTag));
    }
    if (deferredSearch.trim()) {
      const q = deferredSearch.trim().toLowerCase();
      result = result.filter((n) => {
        const hay = [n.title, n.summary, ...n.tags, n.category].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }

    return result;
  }, [notes, activeCategory, activeTag, deferredSearch]);

  const hasFilters = Boolean(search || activeCategory || activeTag);

  return (
    <div className="mt-10">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-faint"
          >
            <circle cx="10.5" cy="10.5" r="6.75" />
            <path d="m15.5 15.5 4.5 4.5" />
          </svg>
          <input
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-full border border-hairline bg-white/[0.03] pl-10 pr-4 text-[0.875rem] text-ink placeholder:text-ink-faint outline-none transition-colors duration-300 focus:border-electric-500/40 focus:bg-white/[0.05]"
          />
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
                aria-pressed={activeCategory === cat}
                className={cn(
                  "h-8 rounded-full border px-3 text-[0.75rem] font-medium transition-all duration-300",
                  activeCategory === cat
                    ? "border-electric-500/30 bg-electric-500/12 text-electric-200"
                    : "border-hairline bg-white/[0.03] text-ink-muted hover:text-ink",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Tag filter */}
        {tags.length > 0 && (
          <select
            value={activeTag}
            onChange={(e) => setActiveTag(e.target.value)}
            aria-label="Filter by tag"
            className="h-9 appearance-none rounded-full border border-hairline bg-white/[0.03] pr-8 pl-3.5 text-[0.8125rem] text-ink-muted outline-none transition-colors duration-300 focus:border-electric-500/40 hover:text-ink"
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setActiveCategory(""); setActiveTag(""); }}
            className="text-[0.75rem] font-medium text-ink-faint underline hover:text-ink"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-hairline bg-white/[0.02] p-8 text-center text-[0.9375rem] text-ink-muted">
          No notes match your filters. Try a different search term or clear the filters.
        </div>
      ) : (
        <>
          <p className="mt-6 font-mono text-[0.6875rem] tracking-wide text-ink-faint uppercase">
            {filtered.length} note{filtered.length !== 1 ? "s" : ""}
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {filtered.map((note) => (
              <li key={note.slug}>
                <GlassCard as="article" className="p-0">
                  <Link href={`/notes/${note.slug}`} className="block rounded-3xl p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-faint uppercase">
                      <time dateTime={note.date}>{formatDate(note.date)}</time>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="size-3.5" />
                        {note.readingMinutes} min read
                      </span>
                      {note.category && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{note.category}</span>
                        </>
                      )}
                    </div>
                    <h2 className="mt-3 text-[1.25rem] leading-snug font-semibold tracking-tight text-ink transition-colors duration-300 group-hover:text-electric-100 sm:text-[1.375rem]">
                      {note.title}
                    </h2>
                    {note.summary && (
                      <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-muted">
                        {note.summary}
                      </p>
                    )}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      {note.tags.length > 0 ? (
                        <ul className="flex flex-wrap gap-1.5">
                          {note.tags.map((tag) => (
                            <li key={tag}><Tag>{tag}</Tag></li>
                          ))}
                        </ul>
                      ) : <span />}
                      <span aria-hidden="true" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-electric-300">
                        Read <ArrowRightIcon className="size-4" />
                      </span>
                    </div>
                  </Link>
                </GlassCard>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
