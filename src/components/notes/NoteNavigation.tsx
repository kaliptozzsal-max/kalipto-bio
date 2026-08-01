import Link from "next/link";
import type { Note } from "@/lib/notes";

/**
 * Previous / Next navigation at the bottom of a note.
 * Server Component — no client JS.
 */
export function NoteNavigation({ prev, next }: { prev: Note | null; next: Note | null }) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Article navigation"
      className="mt-12 grid gap-4 border-t border-hairline pt-8 sm:grid-cols-2 print:hidden"
    >
      {prev ? (
        <Link
          href={`/notes/${prev.slug}`}
          className="group flex flex-col rounded-xl border border-hairline bg-white/[0.02] p-4 transition-colors hover:border-hairline-strong"
        >
          <span className="text-[0.6875rem] font-medium tracking-wide text-ink-faint uppercase">
            ← Previous
          </span>
          <span className="mt-1.5 text-[0.9375rem] font-medium text-ink transition-colors group-hover:text-electric-200">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/notes/${next.slug}`}
          className="group flex flex-col rounded-xl border border-hairline bg-white/[0.02] p-4 text-right transition-colors hover:border-hairline-strong sm:items-end"
        >
          <span className="text-[0.6875rem] font-medium tracking-wide text-ink-faint uppercase">
            Next →
          </span>
          <span className="mt-1.5 text-[0.9375rem] font-medium text-ink transition-colors group-hover:text-electric-200">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
