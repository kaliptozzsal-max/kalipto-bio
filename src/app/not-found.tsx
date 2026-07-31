import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { navLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page does not exist. Head back to the homepage.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-grid mask-radial-fade opacity-60" />
        <div className="absolute top-1/4 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-electric-600/18 blur-[140px]" />
        <div className="absolute inset-0 bg-noise opacity-[0.035] mix-blend-soft-light" />
      </div>

      <Container className="text-center">
        <p className="font-mono text-[0.6875rem] tracking-[0.24em] text-electric-300 uppercase">
          Error 404
        </p>

        <p
          aria-hidden="true"
          className="mt-6 font-display text-[clamp(5rem,20vw,12rem)] leading-none font-semibold tracking-[-0.05em] text-gradient"
        >
          404
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          This route doesn&apos;t resolve
        </h1>

        <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
          The page you were looking for has moved, been renamed, or never
          existed. Everything else is one link away.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/" size="lg" iconRight={<ArrowRightIcon />}>
            Back to homepage
          </Button>
          <Button href="/#contact" size="lg" variant="secondary">
            Report a broken link
          </Button>
        </div>

        <nav aria-label="Site sections" className="mt-14">
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={`/${link.href}`}
                  className="inline-flex rounded-full border border-hairline bg-white/[0.03] px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-wide text-ink-muted transition-colors duration-300 hover:border-electric-400/40 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
