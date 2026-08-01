import { siteConfig } from "@/data/site";
import { getNotes } from "@/lib/notes";

/**
 * Atom 1.0 feed — RFC 4287.
 */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIso(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export async function GET() {
  const notes = getNotes();
  const feedUrl = `${siteConfig.url}/notes/atom.xml`;
  const newest = notes[0];
  const updated = newest ? toIso(newest.date) : new Date().toISOString();

  const entries = notes
    .map((note) => {
      const url = `${siteConfig.url}/notes/${note.slug}`;
      return `  <entry>
    <title>${escapeXml(note.title)}</title>
    <link href="${escapeXml(url)}" rel="alternate" />
    <id>${escapeXml(url)}</id>
    <published>${toIso(note.date)}</published>
    <updated>${toIso(note.date)}</updated>
${note.summary ? `    <summary>${escapeXml(note.summary)}</summary>\n` : ""}${note.tags.map((tag) => `    <category term="${escapeXml(tag)}" />`).join("\n")}${note.tags.length > 0 ? "\n" : ""}  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(`${siteConfig.name} — Notes`)}</title>
  <link href="${escapeXml(`${siteConfig.url}/notes`)}" rel="alternate" />
  <link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml" />
  <id>${escapeXml(`${siteConfig.url}/notes`)}</id>
  <updated>${updated}</updated>
  <author>
    <name>${escapeXml(siteConfig.name)}</name>
    <uri>${escapeXml(siteConfig.url)}</uri>
  </author>
  <subtitle>${escapeXml("Short write-ups on security, AI, automation and infrastructure.")}</subtitle>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
