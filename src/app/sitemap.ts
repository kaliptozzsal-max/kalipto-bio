import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { isGitHubConfigured } from "@/lib/github";
import { getNotes } from "@/lib/notes";

/**
 * Sitemap.
 *
 * The notes index is only listed once something is published — advertising an
 * empty page to crawlers is worse than not listing it. Drafts are excluded,
 * since `getNotes()` filters them out by default.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const notes = getNotes();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  if (isGitHubConfigured()) {
    entries.push({
      url: `${siteConfig.url}/open-source`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  if (notes.length > 0) {
    entries.push({
      url: `${siteConfig.url}/notes`,
      lastModified: new Date(notes[0].date),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const note of notes) {
      entries.push({
        url: `${siteConfig.url}/notes/${note.slug}`,
        lastModified: new Date(note.date),
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
