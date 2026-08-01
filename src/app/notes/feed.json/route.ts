import { siteConfig } from "@/data/site";
import { getNotes } from "@/lib/notes";

/**
 * JSON Feed 1.1 — https://www.jsonfeed.org/version/1.1/
 */
export async function GET() {
  const notes = getNotes();

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${siteConfig.name} — Notes`,
    home_page_url: `${siteConfig.url}/notes`,
    feed_url: `${siteConfig.url}/notes/feed.json`,
    description: "Short write-ups on security, AI, automation and infrastructure.",
    language: "en",
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    items: notes.map((note) => ({
      id: `${siteConfig.url}/notes/${note.slug}`,
      url: `${siteConfig.url}/notes/${note.slug}`,
      title: note.title,
      summary: note.summary || undefined,
      date_published: new Date(note.date).toISOString(),
      tags: [...note.tags],
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
