# kalipto-bio

Personal portfolio for **Kalipto** — cybersecurity, AI, automation and clinical
engineering.

**Live at [www.kaliptosal.dev](https://www.kaliptosal.dev)**

[![CI](https://github.com/kaliptozzsal-max/kalipto-bio/actions/workflows/ci.yml/badge.svg)](https://github.com/kaliptozzsal-max/kalipto-bio/actions/workflows/ci.yml)
[![CodeQL](https://github.com/kaliptozzsal-max/kalipto-bio/actions/workflows/codeql.yml/badge.svg)](https://github.com/kaliptozzsal-max/kalipto-bio/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0a84ff.svg)](LICENSE)

---

## Overview

A single-page portfolio with a notes section, built as a static site with two
live data sources: repositories read from the GitHub API, and contact form
submissions delivered over the Telegram Bot API.

Two principles shaped the code, and both are worth knowing before changing
anything:

**Content is factual.** No invented projects, statistics, job history or
credentials. Where there is nothing real to show, the relevant section hides
itself rather than displaying placeholders. A "Current Focus" section describes
what is being learned instead of claiming finished work.

**Features degrade instead of breaking.** No environment variable is required to
build or run. An unset GitHub username hides the Projects section; an unset
Telegram token makes the contact form fall back to a message telling the sender
to reach out directly. This is why CI can run a production build with no secrets
configured.

Measured Lighthouse on throttled mobile: **93** performance, **100**
accessibility, **100** best practices, **100** SEO. Desktop is 100 across all
four.

## Features

- **Derived navigation** — Projects and Notes links appear only once there is
  real content behind them, and disappear again if there is not.
- **GitHub projects** — repositories fetched from the GitHub REST API, sorted by
  stars then recency, revalidated hourly. Forks, archived and private repos are
  filtered out.
- **Contact form** — validation logic shared between client and server, a
  honeypot field, coarse rate limiting, and parallel independent delivery to
  Telegram and email so one failing does not lose the message.
- **Notes** — MDX with YAML frontmatter, drafts, reading time, RSS feed,
  per-note Open Graph images, sitemap entries, and build-time syntax
  highlighting via Shiki (no client-side JavaScript for code blocks).
- **SEO** — per-route metadata, canonical URLs, Open Graph and Twitter cards,
  generated favicons and social images, `robots.txt`, `sitemap.xml`, JSON-LD
  `Person` and `BlogPosting` structured data.
- **Accessibility** — WCAG AA contrast throughout, a skip link, focus-visible
  outlines, keyboard-trappable mobile menu, and `prefers-reduced-motion`
  honoured globally.
- **Security** — hardening headers, `/.well-known/security.txt` per RFC 9116,
  CodeQL scanning, and Dependabot on both npm and Actions.

## Tech stack

| Layer      | Choice                                    |
| ---------- | ----------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)        |
| Language   | TypeScript (strict)                       |
| Styling    | Tailwind CSS v4                           |
| Animation  | Framer Motion (`LazyMotion` + `m`)        |
| Content    | MDX, `gray-matter`, Shiki                 |
| Icons      | `react-icons` plus hand-rolled inline SVG  |
| Hosting    | Vercel                                    |

A few decisions that look unusual on purpose, each documented in the file where
it applies:

- **One font family.** Any font used by text in the first viewport is fetched at
  the highest priority, ahead of scripts. A second display face cost ~34 KB of
  critical-path bytes, so headings get their character from weight and tracking
  instead.
- **Inter is self-hosted in the stylesheet, not via `next/font`.** `next/font`
  emits its `@font-face` rules as a second render-blocking stylesheet, which
  cost roughly 600 ms of LCP on throttled mobile.
- **Ambient background motion is CSS, not Framer Motion.** A JavaScript
  animation loop that never ends occupies the main thread for the life of the
  page — those three drifting shapes alone added over two seconds of Total
  Blocking Time. Framer Motion drives everything the user triggers.
- **CSS inlining is off.** It made the compressed HTML ~38 KB larger while
  saving a ~13 KB stylesheet.

## Getting started

Requires **Node 20.9 or newer** (Next.js 16's floor) and npm.

```bash
git clone https://github.com/kaliptozzsal-max/kalipto-bio.git
cd kalipto-bio
npm ci
cp .env.example .env.local   # optional — see Configuration
npm run dev
```

Open <http://localhost:3000>.

`npm ci` rather than `npm install`: it installs exactly what the lockfile
specifies, which is what CI does too.

## Configuration

Every value is optional. Put real values in `.env.local`, which is git-ignored.

> **`.env.example` is committed.** It is the template. Never put real values in
> it.

| Variable               | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to the production URL.               |
| `TELEGRAM_BOT_TOKEN`   | From [@BotFather](https://t.me/BotFather). Contact delivery.     |
| `TELEGRAM_CHAT_ID`     | Your chat id — see `npm run telegram:chat-id`.                  |
| `RESEND_API_KEY`       | Optional email delivery alongside Telegram.                     |
| `CONTACT_FROM_EMAIL`   | Sender on a domain verified with your mail provider.             |
| `CONTACT_TO_EMAIL`     | Recipient. Defaults to the address in `src/data/site.ts`.        |
| `GITHUB_TOKEN`         | Raises the GitHub API rate limit from 60 to 5,000 requests/hour. |

Public, non-secret configuration lives in [`src/data/site.ts`](src/data/site.ts):
name, roles, location, contact channels, and `githubUsername` — the one value
that switches the Projects section on.

### Telegram setup

1. Message [@BotFather](https://t.me/BotFather) and send `/newbot`
2. Put the token in `.env.local` as `TELEGRAM_BOT_TOKEN`
3. Open your bot, press **Start**, send it any message — a bot cannot message
   you until you have messaged it first
4. Run `npm run telegram:chat-id` and copy the printed id into `.env.local`

## Development

| Command                     | What it does                                |
| --------------------------- | ------------------------------------------- |
| `npm run dev`               | Dev server with hot reload                  |
| `npm run build`             | Production build                            |
| `npm start`                 | Serve the production build                  |
| `npm run lint`              | ESLint                                      |
| `npm run typecheck`         | `tsc --noEmit`                              |
| `npm run verify`            | Lint, typecheck and build — the CI gate      |
| `npm run note -- "Title"`   | Scaffold a new note                         |
| `npm run telegram:chat-id`  | Print chat ids your bot can reach           |

Run `npm run verify` before pushing; it is exactly what CI enforces.

### Project structure

```
src/
├── app/                     routes, metadata, API, generated icons and OG images
│   ├── api/contact/         contact form endpoint
│   └── notes/               notes index, [slug] page, RSS feed
├── components/
│   ├── background/          mesh gradient, aurora, particles, cursor spotlight
│   ├── layout/              navbar, footer
│   ├── motion/              Framer Motion provider and reveal primitives
│   ├── sections/            hero, about, skills, focus, projects, stack, contact
│   └── ui/                  button, card, container, icons, headings, tags
├── content/notes/           MDX notes (`_`-prefixed files are ignored)
├── data/                    site config, skills, focus areas, tech stack
├── lib/                     GitHub client, notes loader, Telegram, validation
└── mdx-components.tsx       MDX element styling (required by @next/mdx)
```

### Writing a note

```bash
npm run note -- "What I learned about Docker networking"
```

Creates `src/content/notes/<slug>.mdx` with today's date, as a draft. Drafts are
reachable by URL and marked `noindex`, but stay out of the listing, RSS feed and
sitemap. Set `draft: false` to publish. `src/content/notes/_template.mdx`
documents every frontmatter field.

## Deployment

Deployed on **Vercel**, which builds and promotes automatically on every push to
`main`.

To deploy your own copy:

1. Import the repository into Vercel — the framework is detected automatically,
   so no build settings are needed
2. Add any environment variables from the table above under **Settings →
   Environment Variables**. Local `.env.local` is not uploaded.
3. Add your domain under **Settings → Domains**

Two things worth checking:

- If you use `www`, make sure it is the **primary** domain. If the apex is
  primary instead, Vercel redirects `www` → apex and every canonical URL becomes
  a redirect.
- Update `siteConfig.url` in `src/data/site.ts` to your own host. It is the
  source for canonical tags, Open Graph URLs, the sitemap and the RSS feed —
  pointing at a domain you do not control tells search engines someone else owns
  your content.

The site builds fully statically apart from `/api/contact` and `/notes/rss.xml`,
so it works on any Node host or, with minor changes, as a static export.

## Contributing

It is a personal site, so feature requests may not be taken up — but bug reports
and corrections are genuinely welcome. Issue forms and a pull request checklist
are provided.

Security vulnerabilities: please follow [SECURITY.md](SECURITY.md) rather than
opening a public issue.

## License

[MIT](LICENSE) © 2026 Kalipto

The code is free to reuse. Please replace the personal content — name, contact
details, notes and the copy in `src/data/` — with your own.
