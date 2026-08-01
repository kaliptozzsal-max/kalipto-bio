import { Container } from "@/components/ui/Container";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { contactChannels, siteConfig } from "@/data/site";
import { getNavLinks } from "@/lib/navigation";

export function Footer() {
  // Evaluated at render time, so the year never goes stale.
  const year = new Date().getFullYear();
  const navLinks = getNavLinks();

  return (
    <footer className="relative border-t border-hairline">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px left-1/2 h-px w-[28rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-electric-400/60 to-transparent"
      />

      <Container size="wide" className="py-12 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <a
              href="#top"
              className="inline-flex min-h-11 items-center gap-2.5 text-[0.9375rem] font-semibold tracking-tight lg:min-h-0"
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-xl bg-electric-500/15 font-mono text-xs font-bold text-electric-300 ring-1 ring-electric-400/40"
              >
                K
              </span>
              {siteConfig.name}
            </a>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-muted">
              Learning and building across cybersecurity, AI, automation and
              clinical engineering — from {siteConfig.location}.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:pt-1">
            <h2 className="text-xs font-medium tracking-[0.16em] text-ink-faint uppercase lg:text-[0.6875rem] lg:leading-normal">
              Sections
            </h2>
            {/*
              One column on mobile. The old two-column grid put 16px-tall links
              side by side, which measured well under the 44px touch minimum and
              read as a crowded block. Each row is now a full-width 44px target;
              the original grid returns from `sm`.
            */}
            <ul className="mt-3 flex flex-col sm:mt-4 sm:grid sm:grid-cols-3 sm:gap-x-10 sm:gap-y-3 lg:grid-cols-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {/* Section anchors are prefixed so they work from /notes too. */}
                  <a
                    href={link.kind === "anchor" ? `/${link.href}` : link.href}
                    className="-mx-2 flex min-h-11 items-center rounded-lg px-2 text-sm text-ink-muted transition-colors duration-300 active:bg-white/[0.05] hover:text-ink sm:mx-0 sm:px-0 sm:text-[0.8125rem] lg:inline-flex lg:min-h-0"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:pt-1">
            <h2 className="text-xs font-medium tracking-[0.16em] text-ink-faint uppercase lg:text-[0.6875rem] lg:leading-normal">
              Reach me
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {contactChannels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    {...(channel.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    aria-label={channel.label}
                    title={channel.label}
                    className="grid size-11 place-items-center rounded-xl border border-hairline bg-white/[0.03] text-ink-muted transition-[color,border-color,transform] duration-300 active:bg-white/[0.07] lg:size-10 lg:hover:-translate-y-0.5 lg:hover:border-electric-400/40 lg:hover:text-electric-300"
                  >
                    <SocialIcon icon={channel.icon} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <p className="text-[0.8125rem] text-ink">
              Designed &amp; Built by{" "}
              <span className="font-medium">{siteConfig.name}</span>
            </p>
            <p className="text-[0.75rem] text-ink-muted">
              Made with Next.js, TypeScript, Tailwind CSS, and Framer Motion.
            </p>
          </div>

          <p className="text-[0.75rem] text-ink-faint">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
