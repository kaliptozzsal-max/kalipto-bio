/**
 * Identity and contact configuration — the single place to edit personal data.
 *
 * Everything here is real, supplied by Kalipto. Nothing is inferred or invented:
 * only channels that actually exist are listed, and the UI renders exactly what
 * is in this file. To add a platform later (GitHub, LinkedIn, X, …) append an
 * entry to `contactChannels` with its real URL — see the commented example.
 */

export const siteConfig = {
  name: "Kalipto",
  /** Shown under the name in the hero. */
  roles: [
    "Cybersecurity Researcher",
    "AI Developer",
    "Automation Engineer",
    "Clinical Engineering",
  ],
  tagline: "Cybersecurity, AI, Automation & Clinical Engineering",
  description:
    "I build intelligent software, automate complex workflows, research cybersecurity, and develop AI-powered solutions that bridge healthcare and modern technology.",
  location: "Cambodia",
  locale: "en_US",
  email: "kaliptozzsal@gmail.com",
  /** E.164 for `tel:` links; `phoneDisplay` is what people read. */
  phone: "+85581862101",
  phoneDisplay: "+855 81 862 101",
  /**
   * GitHub username — drives the Projects section, which reads live from the
   * GitHub API. Leave as an empty string until you have an account: the section
   * and its navigation link hide themselves rather than showing placeholders.
   */
  // Typed as `string` rather than the empty literal so the checks in
  // `lib/github.ts` stay meaningful once you fill it in.
  githubUsername: "" as string,
  /**
   * Canonical origin. Set NEXT_PUBLIC_SITE_URL in your Vercel project settings;
   * the fallback only keeps local builds and previews working.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://kalipto.dev",
  keywords: [
    "Kalipto",
    "cybersecurity",
    "AI developer",
    "automation engineer",
    "clinical engineering",
    "biomedical engineering",
    "Next.js",
    "TypeScript",
    "Python",
    "FastAPI",
    "self-taught developer",
    "Cambodia",
  ],
} as const;

export type ContactIcon =
  | "email"
  | "phone"
  | "telegram"
  | "broadcast"
  | "github"
  | "linkedin"
  | "x";

export type ContactChannel = {
  label: string;
  icon: ContactIcon;
  /** Full URL, or a `mailto:` / `tel:` scheme. */
  href: string;
  /** Short display text shown under the label. */
  handle: string;
  /** True for links that leave the site and need target/rel. */
  external?: boolean;
};

export const contactChannels: readonly ContactChannel[] = [
  {
    label: "Email",
    icon: "email",
    href: `mailto:${siteConfig.email}`,
    handle: siteConfig.email,
  },
  {
    label: "Telegram",
    icon: "telegram",
    href: "https://t.me/kaliptoz",
    handle: "@kaliptoz",
    external: true,
  },
  {
    label: "Telegram Channel",
    icon: "broadcast",
    href: "https://t.me/kalipto_is_the_best",
    handle: "@kalipto_is_the_best",
    external: true,
  },
  {
    label: "Phone",
    icon: "phone",
    href: `tel:${siteConfig.phone}`,
    handle: siteConfig.phoneDisplay,
  },
  // To add another platform, append its real URL, e.g.
  // { label: "GitHub", icon: "github", href: "https://github.com/<handle>",
  //   handle: "@<handle>", external: true },
] as const;

/** Channels suitable for schema.org `sameAs` — public profiles, not private contact methods. */
export const profileUrls = contactChannels
  .filter((channel) => channel.external)
  .map((channel) => channel.href);

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Focus", href: "#focus" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
] as const;

/** Self-described qualities used in the About section. */
export const brandValues = [
  {
    title: "Curious",
    body: "I like understanding how things work underneath, not just how to use them.",
  },
  {
    title: "Self-driven",
    body: "Most of what I know came from choosing a problem and working through it.",
  },
  {
    title: "Always learning",
    body: "There is a new topic in progress at any given time, and notes to go with it.",
  },
  {
    title: "Detail-oriented",
    body: "Small details decide whether software is secure, correct and pleasant to use.",
  },
  {
    title: "Reliable",
    body: "I would rather scope something honestly and finish it than over-promise.",
  },
  {
    title: "Practical",
    body: "I build things meant to be used, then keep refining them.",
  },
] as const;
