import { siteConfig } from "@/data/site";

/**
 * GitHub repository feed.
 *
 * Everything shown in the Projects section comes from this file, which reads
 * directly from the GitHub REST API. That is deliberate: the data cannot drift
 * from reality or overstate anything, because GitHub is the source of truth. If
 * the handle is not configured, or the request fails, the section renders
 * nothing rather than inventing placeholders.
 */

/** Shape of the fields we use from GitHub's `/users/:user/repos` response. */
type GitHubRepoResponse = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  license: { key: string; name: string; spdx_id: string } | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  pushed_at: string;
  updated_at: string;
  created_at: string;
};

export type Repo = {
  id: number;
  name: string;
  description: string | null;
  url: string;
  /** `homepage` if the repo sets one — treated as the live demo link. */
  demoUrl: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: readonly string[];
  pushedAt: string;
};

/** Cache lifetime for the repo list, in seconds. */
const REVALIDATE_SECONDS = 60 * 60; // 1 hour

const MAX_REPOS = 6;

/**
 * Brand colours for the languages this site is likely to show. Anything not
 * listed falls back to the accent colour, so an unknown language degrades
 * quietly instead of rendering an empty dot.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  Shell: "#89E051",
  Dockerfile: "#384D54",
  HTML: "#E34C26",
  CSS: "#663399",
  Go: "#00ADD8",
  Rust: "#DEA584",
  C: "#555555",
  "C++": "#F34B7D",
  Java: "#B07219",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Lua: "#000080",
  PowerShell: "#012456",
  Makefile: "#427819",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
};

export function languageColor(language: string | null): string {
  if (!language) return "#0a84ff";
  return LANGUAGE_COLORS[language] ?? "#0a84ff";
}

/** True when a GitHub handle has been configured. */
export function isGitHubConfigured(): boolean {
  return typeof siteConfig.githubUsername === "string"
    && siteConfig.githubUsername.length > 0;
}

/**
 * Fetches public repositories for the configured user.
 *
 * Returns an empty array — never throws — when the handle is unset, the network
 * fails, or GitHub rate-limits us. A portfolio section is not worth taking the
 * whole page down for, and an empty result simply hides the section.
 *
 * Set GITHUB_TOKEN to raise the rate limit from 60 to 5,000 requests an hour.
 * It only ever needs public read access; a token with no scopes is enough.
 */
export async function fetchRepos(): Promise<Repo[]> {
  const username = siteConfig.githubUsername;
  if (!username) return [];

  const headers = githubHeaders();

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&type=owner`,
      {
        headers,
        // Time-based revalidation: the build prerenders this, then it refreshes
        // at most once an hour without a redeploy.
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!response.ok) {
      console.warn(
        `[github] ${response.status} ${response.statusText} for user "${username}" — hiding the projects section.`,
      );
      return [];
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) return [];

    return (data as GitHubRepoResponse[])
      // Only original, public, non-archived work.
      .filter((repo) => !repo.fork && !repo.archived && !repo.private)
      .sort((a, b) => {
        // Stars first, then most recently pushed. Puts the strongest work up
        // top while still surfacing fresh repos that have no stars yet.
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return Date.parse(b.pushed_at) - Date.parse(a.pushed_at);
      })
      .slice(0, MAX_REPOS)
      .map(
        (repo): Repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          demoUrl: repo.homepage?.trim() ? repo.homepage.trim() : null,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          topics: repo.topics ?? [],
          pushedAt: repo.pushed_at,
        }),
      );
  } catch (error) {
    console.warn("[github] request failed — hiding the projects section.", error);
    return [];
  }
}

/** "Updated 3 days ago" — coarse on purpose, so it never looks stale by a second. */
export function relativeTime(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";

  const days = Math.floor((Date.now() - then) / 86_400_000);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}


// ═══════════════════════════════════════════════════════════════════════════════
// Open Source Hub — extended types and fetchers
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Categories inferred from repository topics, language, and name.
 * A repo can only belong to one category — the first match wins.
 */
export const REPO_CATEGORIES = [
  "All",
  "Security",
  "AI & ML",
  "Automation",
  "Web",
  "CLI & Tools",
  "Other",
] as const;

export type RepoCategory = (typeof REPO_CATEGORIES)[number];

/** Sort options available in the hub UI. */
export type RepoSort = "stars" | "updated" | "name" | "created";

/** Extended repo shape used by the /open-source hub. */
export type FullRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  cloneUrl: string;
  demoUrl: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: readonly string[];
  license: string | null;
  licenseSpdx: string | null;
  archived: boolean;
  pushedAt: string;
  createdAt: string;
  category: RepoCategory;
  /** True if the repo is starred or pinned (top 3 by stars). */
  featured: boolean;
};

// ── Category inference ──────────────────────────────────────────────────────

const SECURITY_SIGNALS = [
  "security", "cybersecurity", "pentest", "ctf", "exploit", "vulnerability",
  "malware", "forensics", "reverse-engineering", "osint", "infosec", "crypto",
  "encryption", "firewall", "ids", "siem", "threat", "zero-day", "burp",
  "nmap", "metasploit", "wireshark",
];

const AI_SIGNALS = [
  "ai", "ml", "machine-learning", "deep-learning", "neural", "llm", "gpt",
  "transformer", "nlp", "computer-vision", "tensorflow", "pytorch", "keras",
  "huggingface", "langchain", "openai", "chatbot", "model",
];

const AUTOMATION_SIGNALS = [
  "automation", "bot", "scraper", "crawler", "pipeline", "ci", "cd", "devops",
  "ansible", "terraform", "docker", "kubernetes", "workflow", "cron", "scheduler",
];

const WEB_SIGNALS = [
  "web", "nextjs", "react", "vue", "angular", "svelte", "frontend", "backend",
  "fullstack", "api", "rest", "graphql", "html", "css", "tailwind", "node",
  "express", "django", "flask", "fastapi", "portfolio", "website",
];

const CLI_SIGNALS = [
  "cli", "tool", "utility", "terminal", "shell", "bash", "script", "command",
  "generator", "converter", "formatter", "linter",
];

/**
 * Infers a category from repo metadata. Matches against topics first (most
 * intentional), then repo name, then description. First match wins.
 */
function inferCategory(repo: GitHubRepoResponse): RepoCategory {
  const signals = [
    ...(repo.topics ?? []).map((t) => t.toLowerCase()),
    repo.name.toLowerCase().replace(/[-_]/g, " ").split(" "),
    (repo.description ?? "").toLowerCase().split(/\W+/),
  ].flat();

  const matches = (keywords: string[]) =>
    keywords.some((keyword) => signals.includes(keyword));

  if (matches(SECURITY_SIGNALS)) return "Security";
  if (matches(AI_SIGNALS)) return "AI & ML";
  if (matches(AUTOMATION_SIGNALS)) return "Automation";
  if (matches(WEB_SIGNALS)) return "Web";
  if (matches(CLI_SIGNALS)) return "CLI & Tools";

  // Language-based fallback
  const lang = repo.language?.toLowerCase() ?? "";
  if (["typescript", "javascript", "html", "css"].includes(lang)) return "Web";
  if (["python"].includes(lang) && matches(["data", "notebook", "jupyter"])) return "AI & ML";

  return "Other";
}

// ── Shared request headers ──────────────────────────────────────────────────

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": `${siteConfig.name}-portfolio`,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Paginated fetch ─────────────────────────────────────────────────────────

/**
 * Fetches ALL public, non-fork repositories for the configured user.
 *
 * Unlike `fetchRepos()` which returns the top 6 for the homepage section, this
 * returns everything (including archived repos) for the full open-source hub.
 * Paginated to handle accounts with 100+ repos.
 *
 * Returns an empty array on any failure — never throws.
 */
export async function fetchAllRepos(): Promise<FullRepo[]> {
  const username = siteConfig.githubUsername;
  if (!username) return [];

  const headers = githubHeaders();
  const allRaw: GitHubRepoResponse[] = [];

  try {
    let page = 1;
    const perPage = 100;

    // GitHub caps at 100 per page; iterate until we get fewer than perPage.
    while (page <= 10) {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=pushed&type=owner`,
        {
          headers,
          next: { revalidate: REVALIDATE_SECONDS },
        },
      );

      if (!response.ok) {
        console.warn(
          `[github] ${response.status} ${response.statusText} fetching page ${page} for "${username}".`,
        );
        break;
      }

      const data = (await response.json()) as unknown;
      if (!Array.isArray(data) || data.length === 0) break;

      allRaw.push(...(data as GitHubRepoResponse[]));

      if (data.length < perPage) break;
      page += 1;
    }
  } catch (error) {
    console.warn("[github] fetchAllRepos failed.", error);
    return [];
  }

  // Filter out forks but KEEP archived repos (shown with a badge).
  const filtered = allRaw.filter((repo) => !repo.fork && !repo.private);

  // Determine "featured" — top 3 by stars among non-archived repos.
  const starSorted = [...filtered]
    .filter((r) => !r.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
  const featuredIds = new Set(starSorted.slice(0, 3).map((r) => r.id));

  return filtered.map(
    (repo): FullRepo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      demoUrl: repo.homepage?.trim() || null,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics ?? [],
      license: repo.license?.name ?? null,
      licenseSpdx: repo.license?.spdx_id ?? null,
      archived: repo.archived,
      pushedAt: repo.pushed_at,
      createdAt: repo.created_at,
      category: inferCategory(repo),
      featured: featuredIds.has(repo.id),
    }),
  );
}

// ── Sorting ─────────────────────────────────────────────────────────────────

/** Sort a repo list in place (or a copy). Returns a new sorted array. */
export function sortRepos(repos: readonly FullRepo[], sort: RepoSort): FullRepo[] {
  const copy = [...repos];

  switch (sort) {
    case "stars":
      return copy.sort((a, b) => b.stars - a.stars || Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
    case "updated":
      return copy.sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "created":
      return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    default:
      return copy;
  }
}

// ── Filtering ───────────────────────────────────────────────────────────────

/** Filter repos by category, search term, and archived status. */
export function filterRepos(
  repos: readonly FullRepo[],
  options: {
    category?: RepoCategory;
    search?: string;
    includeArchived?: boolean;
  },
): FullRepo[] {
  let result = [...repos];

  // Category filter — "All" shows everything.
  if (options.category && options.category !== "All") {
    result = result.filter((r) => r.category === options.category);
  }

  // Archived filter — hidden by default.
  if (!options.includeArchived) {
    result = result.filter((r) => !r.archived);
  }

  // Text search — name, description, topics, language.
  if (options.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    result = result.filter((r) => {
      const haystack = [
        r.name,
        r.description ?? "",
        r.language ?? "",
        ...r.topics,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return result;
}
