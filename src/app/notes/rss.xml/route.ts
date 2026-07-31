import { siteConfig } from "@/data/site";
import { getNotes } from "@/lib/notes";

/**
 * RSS 2.0 feed for the notes.
 *
 * Built as a Route Handler rather than a static file so it can never fall out of
 * sync with the content directory.
 */

/** XML has five predefined entities; every interpolated value goes through this. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? new Date().toUTCString()
    : parsed.toUTCString();
}

export async function GET() {
  const notes = getNotes();
  const feedUrl = `${siteConfig.url}/notes/rss.xml`;

  const items = notes
    .map((note) => {
      const url = `${siteConfig.url}/notes/${note.slug}`;

      return `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${toRfc822(note.date)}</pubDate>
${note.summary ? `      <description>${escapeXml(note.summary)}</description>\n` : ""}${note.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n")}${note.tags.length > 0 ? "\n" : ""}    </item>`;
    })
    .join("\n");

  const newest = notes[0];
  const lastBuild = newest ? toRfc822(newest.date) : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} — Notes`)}</title>
    <link>${escapeXml(`${siteConfig.url}/notes`)}</link>
    <description>${escapeXml("Short write-ups on security, AI, automation and infrastructure.")}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
