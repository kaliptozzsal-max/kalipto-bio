import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { isGitHubConfigured } from "@/lib/github";
import { getNotes } from "@/lib/notes";

const toolSlugs = [
  "camera",
  "json",
  "jwt",
  "base64",
  "uuid",
  "hash",
  "regex",
  "timestamp",
  "url",
  "markdown",
] as const;

/** Build the public sitemap from configured and published content. */
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

  entries.push({
    url: `${siteConfig.url}/arcade`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  });

  entries.push({
    url: `${siteConfig.url}/challenge`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  });

  entries.push({
    url: `${siteConfig.url}/tools`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  });

  for (const slug of toolSlugs) {
    entries.push({
      url: `${siteConfig.url}/tools/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
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
