import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { SiteBackground } from "@/components/background/SiteBackground";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { profileUrls, siteConfig } from "@/data/site";
import { getNavLinks } from "@/lib/navigation";
import "./globals.css";

/*
 * Typography: one self-hosted variable family (Inter), declared in
 * `globals.css` and preloaded below. No font request leaves the origin.
 *
 * A single family is a deliberate performance decision. Any font used by text in
 * the first viewport is fetched by Chrome at the highest priority, ahead of every
 * script, so a second display face sits directly in front of the hero paint.
 * Measured on throttled mobile, adding one cost ~34 KB of critical-path bytes.
 *
 * Display presence comes from weight and tracking instead — headings use tighter
 * negative letter-spacing (see globals.css), which is what Inter is designed for
 * at large optical sizes. Monospace uses the platform face; it only ever sets
 * small uppercase labels.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: "/" },
  category: "technology",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#04060b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Users must be able to zoom (WCAG 1.4.4)
  maximumScale: 5,
};

/**
 * Person schema. States only verifiable, supplied facts — no invented job
 * titles, employers, credentials or dates.
 */
function StructuredData() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: siteConfig.location,
    },
    knowsAbout: [...siteConfig.keywords],
    sameAs: profileUrls,
  };

  return (
    <script
      type="application/ld+json"
      // Serialised from static, developer-authored data only.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /*
   * The font is referenced from the stylesheet, so the browser would only
   * discover it after CSS is parsed. Preloading starts the download in parallel
   * with the stylesheet instead.
   *
   * React's `preload` is used rather than a raw <link> in <head>: React also
   * hoists such a link itself, which emits the tag twice.
   */
  preload("/fonts/inter-latin-var.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });

  return (
    <html
      lang="en"
      // Lets Next.js manage scroll on route changes while CSS keeps smooth scrolling
      data-scroll-behavior="smooth"
    >
      <head>
        {/*
          Safety net: entrance animations start from `opacity: 0` inline styles.
          If JavaScript never runs, those styles would leave content invisible.
          An `!important` rule in a stylesheet outranks an inline style, so this
          restores everything for a no-script visitor at zero cost to everyone
          else — the browser only applies it when scripting is unavailable.
        */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                "[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}",
            }}
          />
        </noscript>
      </head>
      <body className="relative min-h-svh antialiased">
        <a
          href="#main"
          className="sr-focusable top-4 left-4 z-[110] rounded-full bg-electric-600 px-5 py-3 text-sm font-medium text-white"
        >
          Skip to main content
        </a>

        <MotionProvider>
          <SiteBackground />
          {/* Navigation is derived on the server — see lib/navigation.ts */}
          <Navbar links={getNavLinks()} />

          <main id="main" tabIndex={-1}>
            {children}
          </main>

          <Footer />
        </MotionProvider>

        <StructuredData />
      </body>
    </html>
  );
}
