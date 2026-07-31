import createMDX from "@next/mdx";
import type { NextConfig } from "next";

/**
 * Baseline hardening headers. These are intentionally conservative — the site
 * serves only first-party assets, so nothing here needs relaxing.
 *
 * A full Content-Security-Policy is deliberately left out: Next.js inlines
 * hydration scripts, so a strict CSP needs per-request nonces via `proxy.ts`.
 * See node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
 * if you want to add one.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /*
   * Lets `.mdx` files be treated as modules and pages. Notes live in
   * `src/content/notes`, outside `app/`, so nothing here creates routes by
   * accident — the `[slug]` page imports them explicitly.
   */
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],

  // Pin the workspace root — a stray lockfile in the home directory otherwise
  // makes Turbopack infer the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },

  /*
   * `experimental.inlineCss` is deliberately left off (the default).
   *
   * Inlining the stylesheet into the document sounds like a win — it removes a
   * request — but measured on this page it made the compressed HTML ~38 KB
   * larger while saving only a ~13 KB stylesheet, and pushed Largest
   * Contentful Paint from 2.85s to 3.15s on throttled mobile. A separate
   * stylesheet also stays cacheable across navigations.
   */

  images: {
    formats: ["image/avif", "image/webp"],
    // Avatars and social preview images served by GitHub.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

/**
 * MDX pipeline.
 *
 * Plugins are named as **strings**, not imported functions. Turbopack runs the
 * MDX transform in Rust and cannot receive JavaScript callbacks, so an imported
 * plugin would fail to serialise across that boundary. Options objects are fine
 * as long as every value is serialisable.
 *
 *   remark-frontmatter  parses the YAML block so MDX does not choke on it.
 *                       (`lib/notes.ts` reads the same block with gray-matter.)
 *   remark-gfm          tables, task lists, strikethrough, autolinks.
 *   rehype-slug         stable `id` on every heading.
 *   rehype-autolink…    makes those headings linkable.
 *   @shikijs/rehype     build-time syntax highlighting. Emits inline styles, so
 *                       no highlight theme stylesheet ships to the browser and
 *                       there is zero client-side JavaScript for code blocks.
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "wrap" }],
      ["@shikijs/rehype", { theme: "github-dark-default" }],
    ],
  },
});

export default withMDX(nextConfig);
