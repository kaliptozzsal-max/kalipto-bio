import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyCodeButton } from "@/components/notes/CopyCodeButton";
import { NoteNavigation } from "@/components/notes/NoteNavigation";
import { ReadingProgress } from "@/components/notes/ReadingProgress";
import { RelatedNotes } from "@/components/notes/RelatedNotes";
import { ShareButtons } from "@/components/notes/ShareButtons";
import { TableOfContents } from "@/components/notes/TableOfContents";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon, ClockIcon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { siteConfig } from "@/data/site";
import {
  extractToc,
  formatNoteDate,
  getAllNoteSlugs,
  getNote,
  getPrevNextNotes,
  getRelatedNotes,
} from "@/lib/notes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllNoteSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: "Note not found" };

  const url = `${siteConfig.url}/notes/${note.slug}`;
  return {
    title: note.title,
    description: note.summary || undefined,
    alternates: { canonical: `/notes/${note.slug}` },
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

  const { default: NoteBody } = await import(`@/content/notes/${slug}.mdx`);
  const toc = extractToc(slug);
  const { prev, next } = getPrevNextNotes(slug);
  const related = getRelatedNotes(slug);
  const noteUrl = `${siteConfig.url}/notes/${note.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: note.title,
    datePublished: note.date,
    author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    ...(note.summary ? { description: note.summary } : {}),
    ...(note.tags.length > 0 ? { keywords: note.tags.join(", ") } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": noteUrl },
  };

  return (
    <>
      <ReadingProgress />
      <article className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
        <Container size="wide">
          <div className="xl:grid xl:grid-cols-[1fr_220px] xl:gap-12">
            {/* Main content column */}
            <div className="min-w-0 max-w-3xl">
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase transition-colors duration-300 hover:text-electric-300 print:hidden"
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
                  {note.category && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{note.category}</span>
                    </>
                  )}
                  {note.draft && (
                    <Tag tone="accent" className="normal-case">Draft</Tag>
                  )}
                </div>

                <h1 className="mt-4 text-[2rem] leading-[1.15] font-semibold tracking-[-0.03em] text-balance sm:text-[2.5rem]">
                  {note.title}
                </h1>

                {note.summary && (
                  <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-muted">
                    {note.summary}
                  </p>
                )}

                {note.tags.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <li key={tag}><Tag>{tag}</Tag></li>
                    ))}
                  </ul>
                )}
              </header>

              <div className="mdx-content">
                <NoteBody />
              </div>
              <CopyCodeButton />

              <footer className="mt-16 space-y-8 border-t border-hairline pt-8">
                <ShareButtons title={note.title} url={noteUrl} />
                <NoteNavigation prev={prev} next={next} />
              </footer>

              <RelatedNotes notes={related} />
            </div>

            {/* Table of contents sidebar (desktop only) */}
            <aside className="hidden xl:block">
              <TableOfContents entries={toc} />
            </aside>
          </div>
        </Container>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </article>
    </>
  );
}
