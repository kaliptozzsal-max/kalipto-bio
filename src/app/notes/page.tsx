import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ArrowRightIcon,
  ClockIcon,
  RssIcon,
  TerminalIcon,
} from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { siteConfig } from "@/data/site";
import { formatNoteDate, getNotes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Short write-ups on what I'm learning across security, AI, automation and infrastructure.",
  alternates: {
    canonical: "/notes",
    types: { "application/rss+xml": `${siteConfig.url}/notes/rss.xml` },
  },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/notes`,
    title: `Notes — ${siteConfig.name}`,
    description:
      "Short write-ups on what I'm learning across security, AI, automation and infrastructure.",
  },
};

export default function NotesIndexPage() {
  // Drafts are shown while developing so they can be previewed in the listing.
  const notes = getNotes({ includeDrafts: process.env.NODE_ENV === "development" });

  return (
    <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
      <Container>
        <SectionHeading
          eyebrow="Notes"
          align="left"
          title={
            <>
              Things I&apos;m <span className="text-gradient">figuring out</span>
            </>
          }
          subtitle="Short write-ups as I go — what worked, what didn't, and what I'd do differently. Written mostly so I remember."
        />

        {notes.length === 0 ? (
          <Reveal variant="slideUp" className="mt-14">
            <GlassCard interactive={false} className="p-8 sm:p-10">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl border border-hairline-strong bg-white/[0.05] text-electric-300"
                >
                  <TerminalIcon className="size-5" />
                </span>
                <div>
                  <h2 className="text-[1.0625rem] font-semibold text-ink">
                    Nothing published yet
                  </h2>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                    The first note is on its way. In the meantime, the rest of the
                    site covers what I&apos;m working on.
                  </p>
                  <div className="mt-6">
                    <Button href="/#focus" size="sm" iconRight={<ArrowRightIcon />}>
                      See my current focus
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Reveal>
        ) : (
          <>
            <RevealGroup as="ul" stagger={0.06} className="mt-14 flex flex-col gap-4">
              {notes.map((note) => (
                <RevealItem key={note.slug} as="li" variant="slideUp">
                  <GlassCard as="article" className="p-0">
                    {/*
                      The whole card is one link. Keeping it a single anchor
                      rather than nesting several means one tab stop and one
                      clear accessible name per note.
                    */}
                    <Link
                      href={`/notes/${note.slug}`}
                      className="block rounded-3xl p-6 sm:p-7"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-faint uppercase">
                        <time dateTime={note.date}>
                          {formatNoteDate(note.date)}
                        </time>
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

                      <h2 className="mt-3 text-[1.25rem] leading-snug font-semibold tracking-tight text-ink transition-colors duration-300 group-hover:text-electric-100 sm:text-[1.375rem]">
                        {note.title}
                      </h2>

                      {note.summary ? (
                        <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-muted">
                          {note.summary}
                        </p>
                      ) : null}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        {note.tags.length > 0 ? (
                          <ul className="flex flex-wrap gap-1.5">
                            {note.tags.map((tag) => (
                              <li key={tag}>
                                <Tag>{tag}</Tag>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span />
                        )}

                        <span
                          aria-hidden="true"
                          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-electric-300"
                        >
                          Read
                          <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </GlassCard>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal variant="fadeIn" className="mt-12">
              <a
                href="/notes/rss.xml"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase transition-colors duration-300 hover:border-electric-400/40 hover:text-ink"
              >
                <RssIcon className="size-3.5" />
                Subscribe via RSS
              </a>
            </Reveal>
          </>
        )}
      </Container>
    </div>
  );
}
