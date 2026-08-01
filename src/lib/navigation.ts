import { isGitHubConfigured } from "@/lib/github";
import { hasPublishedNotes } from "@/lib/notes";

/**
 * The navigation is derived, not hard-coded.
 *
 * Projects appears once a GitHub username is configured; Notes appears once at
 * least one note is published. That way the site never advertises a section that
 * would be empty, and both show up automatically the moment there is something
 * real behind them.
 *
 * Server-only — `hasPublishedNotes` reads from disk.
 */

export type NavLink = {
  label: string;
  /** Either a `#section` anchor on the home page, or a route path. */
  href: string;
  /** Anchors participate in scroll-spy; routes do not. */
  kind: "anchor" | "route";
};

export function getNavLinks(): NavLink[] {
  const links: NavLink[] = [
    { label: "About", href: "#about", kind: "anchor" },
    { label: "Skills", href: "#skills", kind: "anchor" },
    { label: "Focus", href: "#focus", kind: "anchor" },
  ];

  if (isGitHubConfigured()) {
    links.push({ label: "Projects", href: "#projects", kind: "anchor" });
  }

  links.push({ label: "Stack", href: "#stack", kind: "anchor" });

  if (hasPublishedNotes()) {
    links.push({ label: "Notes", href: "/notes", kind: "route" });
  }

  if (isGitHubConfigured()) {
    links.push({ label: "Open Source", href: "/open-source", kind: "route" });
  }

  links.push({ label: "Tools", href: "/tools", kind: "route" });

  links.push({ label: "Contact", href: "#contact", kind: "anchor" });

  return links;
}
