import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Notes index.
 *
 * Frontmatter is read straight off disk with gray-matter so the listing page
 * never has to import and compile every MDX file just to show titles. The MDX
 * body itself is compiled by Turbopack when `app/notes/[slug]/page.tsx`
 * dynamically imports it.
 *
 * Server-only: this module uses `node:fs` and must never be imported into a
 * Client Component.
 */

export const NOTES_DIR = path.join(process.cwd(), "src", "content", "notes");

export type Note = {
  slug: string;
  title: string;
  summary: string;
  /** ISO date string, e.g. "2026-07-31". */
  date: string;
  tags: readonly string[];
  /** Rounded minutes, from the word count of the body. */
  readingMinutes: number;
  /** Hidden from listings, RSS and the sitemap, but still reachable by URL. */
  draft: boolean;
};

type Frontmatter = {
  title?: unknown;
  summary?: unknown;
  date?: unknown;
  tags?: unknown;
  draft?: unknown;
};

const WORDS_PER_MINUTE = 210;

function readingMinutesOf(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string");
}

/**
 * Files beginning with `_` are treated as templates and skipped, which is how
 * `_template.mdx` can sit alongside real notes without being published.
 */
function isPublishableFile(filename: string): boolean {
  return filename.endsWith(".mdx") && !filename.startsWith("_");
}

function parseNote(filename: string): Note | null {
  const filePath = path.join(NOTES_DIR, filename);

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const frontmatter = data as Frontmatter;

  const slug = filename.replace(/\.mdx$/, "");
  const title = asString(frontmatter.title);
  const date = asString(frontmatter.date);

  // A note without a title or date is almost certainly a mistake; skipping it
  // is better than rendering "undefined" in a published listing.
  if (!title || !date) {
    console.warn(
      `[notes] "${filename}" is missing a title or date in its frontmatter — skipped.`,
    );
    return null;
  }

  return {
    slug,
    title,
    summary: asString(frontmatter.summary),
    date,
    tags: asTags(frontmatter.tags),
    readingMinutes: readingMinutesOf(content),
    draft: frontmatter.draft === true,
  };
}

function listNoteFiles(): string[] {
  try {
    return fs.readdirSync(NOTES_DIR).filter(isPublishableFile);
  } catch {
    // The directory may not exist yet — that is a valid empty state.
    return [];
  }
}

/**
 * All publishable notes, newest first. Drafts are excluded unless
 * `includeDrafts` is set (used in development so you can preview them).
 */
export function getNotes({ includeDrafts = false } = {}): Note[] {
  return listNoteFiles()
    .map(parseNote)
    .filter((note): note is Note => note !== null)
    .filter((note) => includeDrafts || !note.draft)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/** Every slug that should have a page, including drafts so they stay previewable. */
export function getAllNoteSlugs(): string[] {
  return getNotes({ includeDrafts: true }).map((note) => note.slug);
}

export function getNote(slug: string): Note | null {
  return getNotes({ includeDrafts: true }).find((n) => n.slug === slug) ?? null;
}

/** True when at least one note is published — used to hide empty navigation. */
export function hasPublishedNotes(): boolean {
  return getNotes().length > 0;
}

/** "31 July 2026" — unambiguous, and stable regardless of the reader's locale. */
export function formatNoteDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
