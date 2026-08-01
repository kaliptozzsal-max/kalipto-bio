import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon, ClockIcon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { siteConfig } from "@/data/site";
import { formatNoteDate, getAllNoteSlugs, getNote } from "@/lib/notes";

type PageProps = {
  // In the App Router `params` is a promise and must be awaited.
  params: Promise<{ slug: string }>;
};

/** Prerender every note at build time. */
export function generateStaticParams() {
  return getAllNoteSlugs().map((slug) => ({ slug }));
}

/** Any slug not returned above 404s instead of being rendered on demand. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);

  if (!note) return { title: "Note not found" };

  const url = `${siteConfig.url}/notes/${note.slug}`;

  return {
    title: note.title,
    description: note.summary || undefined,
    alternates: { canonical: `/notes/${note.slug}` },
    // Drafts stay reachable by URL but must never be indexed.
    robots: note.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      url,
      title: note.title,
      description: note.summary || undefined,
      publishedTime: note.date,
      authors: [siteConfig.name],
      tags: [...note.tags],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: note.summary || undefined,
    },
  };
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = getNote(slug);

  if (!note) notFound();

  /*
   * Dynamic import of the MDX module. The template literal is statically
   * analysable, so the bundler compiles every file in that directory and the
   * right one is selected at render time. Compilation happens at build time —
   * no MDX runtime reaches the browser.
   */
  const { default: NoteBody } = await import(`@/content/notes/${slug}.mdx`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: note.title,
    datePublished: note.date,
    author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    ...(note.summary ? { description: note.summary } : {}),
    ...(note.tags.length > 0 ? { keywords: note.tags.join(", ") } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/notes/${note.slug}`,
    },
  };

  return (
    <article className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
      <Container size="narrow">
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase transition-colors duration-300 hover:text-electric-300"
        >
          <ArrowLeftIcon className="size-3.5" />
          All notes
        </Link>

        <header className="mt-8 border-b border-hairline pb-9">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-faint uppercase">
            <time dateTime={note.date}>{formatNoteDate(note.date)}</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-3.5" />
              {note.readingMinutes} min read
            </span>
            {note.draft ? (
              <Tag tone="accent" className="normal-case">
                Draft
              </Tag>
            ) : null}
          </div>

          <h1 className="mt-4 text-[2rem] leading-[1.15] font-semibold tracking-[-0.03em] text-balance sm:text-[2.5rem]">
            {note.title}
          </h1>

          {note.summary ? (
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-muted">
              {note.summary}
            </p>
          ) : null}

          {note.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <li key={tag}>
                  <Tag>{tag}</Tag>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {/* `mdx-content` is styled in globals.css — mainly the Shiki code blocks. */}
        <div className="mdx-content">
          <NoteBody />
        </div>

        <footer className="mt-16 border-t border-hairline pt-8">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-[0.875rem] font-medium text-electric-300 transition-colors duration-300 hover:text-electric-200"
          >
            <ArrowLeftIcon className="size-4" />
            Back to all notes
          </Link>
        </footer>
      </Container>

      <script
        type="application/ld+json"
        // Built from developer-authored frontmatter only.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </article>
  );
}
