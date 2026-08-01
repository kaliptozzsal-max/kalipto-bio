import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import type { Note } from "@/lib/notes";
import { formatNoteDate } from "@/lib/notes";

/**
 * Related articles shown after the current note. Server Component.
 */
export function RelatedNotes({ notes }: { notes: Note[] }) {
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-12 border-t border-hairline pt-8 print:hidden">
      <h2
        id="related-heading"
        className="font-mono text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase"
      >
        Related articles
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {notes.map((note) => (
          <li key={note.slug}>
            <Link
              href={`/notes/${note.slug}`}
              className="group flex flex-col rounded-xl border border-hairline bg-white/[0.02] p-4 transition-colors hover:border-hairline-strong"
            >
              <span className="text-[0.9375rem] font-medium text-ink transition-colors group-hover:text-electric-200">
                {note.title}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-ink-faint">
                <time dateTime={note.date}>{formatNoteDate(note.date)}</time>
                {note.tags.length > 0 && (
                  <span className="flex gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
