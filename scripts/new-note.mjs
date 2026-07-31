#!/usr/bin/env node
/**
 * Scaffolds a new note.
 *
 * Usage:
 *   npm run note -- "What I learned about JWT expiry"
 *
 * Creates src/content/notes/<slug>.mdx with today's date and correct
 * frontmatter, so there is nothing to remember and no template to copy by hand.
 */

import fs from "node:fs";
import path from "node:path";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error(
    '\n  Give the note a title:\n\n    npm run note -- "Your note title"\n',
  );
  process.exit(1);
}

/** "Rate limiting with Redis!" -> "rate-limiting-with-redis" */
const slug = title
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 80);

if (!slug) {
  console.error("\n  That title produced an empty slug. Try adding some letters.\n");
  process.exit(1);
}

const dir = path.join(process.cwd(), "src", "content", "notes");
const file = path.join(dir, `${slug}.mdx`);

if (fs.existsSync(file)) {
  console.error(`\n  ${slug}.mdx already exists.\n`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

// YAML needs quotes escaped, since titles legitimately contain them.
const yamlTitle = title.replace(/"/g, '\\"');

const body = `---
title: "${yamlTitle}"
summary: "One or two sentences describing what this note covers."
date: "${today}"
tags: ["tag"]
draft: true
---

Write the note here. It is Markdown, so **bold**, \`inline code\`, lists, tables
and links all work as usual.

## A heading

Code blocks are highlighted at build time:

\`\`\`ts
const answer = 42;
\`\`\`

Set \`draft: false\` in the frontmatter above when you are ready to publish it.
`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, body, "utf8");

console.log(
  `\n  Created src/content/notes/${slug}.mdx\n\n` +
    `  It is a draft, so it stays out of the listing, RSS feed and sitemap.\n` +
    `  Preview it at /notes/${slug}, then set draft: false to publish.\n`,
);
