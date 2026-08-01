"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import {
  filterRepos,
  sortRepos,
  REPO_CATEGORIES,
  type FullRepo,
  type RepoCategory,
  type RepoSort,
} from "@/lib/github";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { RepoCard } from "./RepoCard";

const SORT_OPTIONS: { value: RepoSort; label: string }[] = [
  { value: "stars", label: "Stars" },
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Newest" },
  { value: "name", label: "Name" },
];

/**
 * Client-side filtering, search, and sort for the open-source hub.
 *
 * All repos are fetched server-side and passed as props. Client-side filtering
 * means instant results with no network round-trips, and useDeferredValue keeps
 * the search input responsive even with hundreds of repos.
 */
export function OpenSourceHub({ repos }: { repos: FullRepo[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<RepoCategory>("All");
  const [sort, setSort] = useState<RepoSort>("stars");
  const [showArchived, setShowArchived] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(
    () =>
      sortRepos(
        filterRepos(repos, {
          category,
          search: deferredSearch,
          includeArchived: showArchived,
        }),
        sort,
      ),
    [repos, category, deferredSearch, sort, showArchived],
  );

  const featured = useMemo(
    () => repos.filter((r) => r.featured && !r.archived),
    [repos],
  );

  // Count repos per category for the pills.
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    for (const r of repos) {
      if (r.archived && !showArchived) continue;
      counts.All = (counts.All ?? 0) + 1;
      counts[r.category] = (counts[r.category] ?? 0) + 1;
    }
    return counts;
  }, [repos, showArchived]);

  const hasArchived = repos.some((r) => r.archived);

  return (
    <div className="mt-10 sm:mt-14">
      {/* Featured projects — shown only when no search/filter is active */}
      {featured.length > 0 && !deferredSearch && category === "All" && (
        <section aria-labelledby="featured-heading" className="mb-12">
          <h2
            id="featured-heading"
            className="mb-5 font-mono text-[0.6875rem] tracking-[0.18em] text-electric-300 uppercase"
          >
            <span aria-hidden="true" className="mr-2.5 inline-block size-1.5 rounded-full bg-electric-400" />
            Featured
          </h2>
          <RevealGroup
            as="ul"
            stagger={0.07}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featured.map((repo) => (
              <RevealItem key={repo.id} as="li" variant="slideUp" className="h-full">
                <RepoCard repo={repo} featured />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}

      {/* Controls: search + category pills + sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-full border border-hairline bg-white/[0.03] pl-10 pr-4 text-[0.875rem] text-ink placeholder:text-ink-faint outline-none transition-colors duration-300 focus:border-electric-500/40 focus:bg-white/[0.05]"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {REPO_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-all duration-300",
                  isActive
                    ? "border-electric-500/30 bg-electric-500/12 text-electric-200"
                    : "border-hairline bg-white/[0.03] text-ink-muted hover:border-hairline-strong hover:text-ink",
                )}
              >
                {cat}
                {count > 0 && (
                  <span className="font-mono text-[0.625rem] text-ink-faint">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div className="relative ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as RepoSort)}
            aria-label="Sort repositories"
            className="h-9 appearance-none rounded-full border border-hairline bg-white/[0.03] pr-8 pl-3.5 text-[0.8125rem] text-ink-muted outline-none transition-colors duration-300 focus:border-electric-500/40 hover:text-ink"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronIcon className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-ink-faint" />
        </div>
      </div>

      {/* Archived toggle — only shown when there are archived repos */}
      {hasArchived && (
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-muted">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="size-4 cursor-pointer rounded border-hairline bg-white/[0.03] accent-electric-500"
          />
          Show archived
        </label>
      )}

      {/* Results grid */}
      {filtered.length === 0 ? (
        <EmptyState filtered />
      ) : (
        <>
          <p className="mt-6 font-mono text-[0.6875rem] tracking-wide text-ink-faint uppercase">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </p>
          <RevealGroup
            key={`${category}-${sort}-${deferredSearch}`}
            as="ul"
            stagger={0.05}
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((repo) => (
              <RevealItem key={repo.id} as="li" variant="slideUp" className="h-full">
                <RepoCard repo={repo} />
              </RevealItem>
            ))}
          </RevealGroup>
        </>
      )}
    </div>
  );
}

// ── Inline icons (tiny, no need for the shared Icon.tsx file) ────────────────

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="10.5" cy="10.5" r="6.75" />
      <path d="m15.5 15.5 4.5 4.5" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}
