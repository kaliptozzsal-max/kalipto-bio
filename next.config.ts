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
const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy.
 *
 * This site is statically rendered and CDN-cacheable, so a per-request nonce
 * (which forces dynamic rendering and disables caching) is deliberately avoided.
 *
 * Next.js emits several inline bootstrap/hydration <script> tags in the HTML it
 * generates. Without a nonce, those inline scripts can only run if `script-src`
 * allows `'unsafe-inline'`; a strict `script-src 'self'` blocks them and the
 * page never hydrates (it stays stuck on the loading state). Since a static
 * export cannot carry a nonce, `'unsafe-inline'` is the correct, functional
 * choice here. `default-src 'self'` still blocks all external script origins,
 * `object-src 'none'` blocks plugins, `base-uri`/`form-action` are locked down,
 * and `frame-ancestors 'none'` prevents clickjacking — so the policy remains a
 * meaningful defense-in-depth layer. In development React also needs
 * `'unsafe-eval'`, which never ships to production.
 *
 * `style-src` allows `'unsafe-inline'` for Tailwind's injected <style>; inline
 * styles cannot execute code.
 */
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://avatars.githubusercontent.com",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
];

const contentSecurityPolicy = cspDirectives.join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    // Same-origin code may request camera access, but browsers still require
    // an explicit user permission grant. Microphone and other sensors stay off.
    value:
      "camera=(self), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=(), bluetooth=(), serial=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const challengeSecurityHeaders = securityHeaders.map((header) =>
  header.key === "Permissions-Policy"
    ? {
        ...header,
        // The CTF needs no device sensors at all.
        value:
          "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=(), bluetooth=(), serial=()",
      }
    : header,
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /*
   * Do not ship browser source maps in production. The browser still receives
   * the app as minified, mangled bundles (that is unavoidable — all client code
   * is downloaded to run), but without source maps the original TypeScript and
   * component structure cannot be reconstructed in DevTools. This is the real,
   * effective way to keep source private; JavaScript "F12 blockers" do not work
   * and only harm normal users.
   */
  productionBrowserSourceMaps: false,

  // Private Wi-Fi origin used for phone testing of dev-only assets/HMR.
  allowedDevOrigins: ["192.168.1.222"],

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
      {
        // The CTF needs no sensors. This later, more-specific rule overrides
        // the global same-origin camera allowance used by Camera Lab.
        source: "/challenge/:path*",
        headers: challengeSecurityHeaders,
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
