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
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  private: boolean;
  pushed_at: string;
  updated_at: string;
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

  const token = process.env.GITHUB_TOKEN;

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    // GitHub asks for a User-Agent identifying the caller.
    "User-Agent": `${siteConfig.name}-portfolio`,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

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
