import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { NotesFilter } from "@/components/notes/NotesFilter";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRightIcon, RssIcon, TerminalIcon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/data/site";
import { getAllTags, getNoteCategories, getNotes, getSearchIndex } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Short write-ups on what I'm learning across security, AI, automation and infrastructure.",
  alternates: {
    canonical: "/notes",
    types: {
      "application/rss+xml": `${siteConfig.url}/notes/rss.xml`,
      "application/atom+xml": `${siteConfig.url}/notes/atom.xml`,
      "application/feed+json": `${siteConfig.url}/notes/feed.json`,
    },
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
  const notes = getNotes({ includeDrafts: process.env.NODE_ENV === "development" });
  const searchIndex = getSearchIndex();
  const categories = getNoteCategories();
  const tags = getAllTags();

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
            <NotesFilter notes={searchIndex} categories={categories} tags={tags} />

            <Reveal variant="fadeIn" className="mt-12">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/notes/rss.xml"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase transition-colors duration-300 hover:border-electric-400/40 hover:text-ink"
                >
                  <RssIcon className="size-3.5" />
                  RSS
                </a>
                <a
                  href="/notes/atom.xml"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase transition-colors duration-300 hover:border-electric-400/40 hover:text-ink"
                >
                  Atom
                </a>
                <a
                  href="/notes/feed.json"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase transition-colors duration-300 hover:border-electric-400/40 hover:text-ink"
                >
                  JSON
                </a>
              </div>
            </Reveal>
          </>
        )}
      </Container>
    </div>
  );
}
