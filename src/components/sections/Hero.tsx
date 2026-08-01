import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowDownIcon, ArrowRightIcon, MapPinIcon } from "@/components/ui/Icon";
import { siteConfig } from "@/data/site";

/**
 * Hero.
 *
 * Mobile and desktop are tuned separately. Every mobile adjustment is a base
 * value with the original pinned back at `sm` or `lg`, so the desktop rendering
 * is unchanged.
 *
 * The mobile goals, in order:
 *   1. Both calls to action reachable without a long scroll.
 *   2. A clear hierarchy — name, then roles, then description — rather than
 *      four blocks of similar visual weight.
 *   3. Nothing overflowing at 320px.
 *   4. Usable in landscape, where 100svh is only ~375px tall.
 */
export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className={[
        "relative flex items-center",
        // Full height only when the viewport is tall enough to deserve it.
        // In landscape on a phone, 100svh forces a cramped, awkward block, so
        // the section is allowed to size to its content instead.
        "min-h-[100svh] max-[820px]:landscape:min-h-0",
        // Top padding clears the fixed header (~72px on mobile) without the
        // 128px the desktop layout uses.
        "pt-24 pb-14 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24",
      ].join(" ")}
    >
      <Container size="wide">
        <RevealGroup
          stagger={0.08}
          className="flex flex-col items-center text-center"
        >
          <RevealItem variant="fadeIn">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-hairline bg-white/[0.035] px-3.5 py-2 font-mono text-xs tracking-[0.08em] text-ink-muted uppercase backdrop-blur-sm min-[400px]:tracking-[0.16em] sm:px-4 lg:text-[0.6875rem] lg:leading-normal">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-electric-400"
              />
              Always learning · always building
            </p>
          </RevealItem>

          {/*
            `rise` moves the name without fading it. This block is the largest
            text on screen, and an element first painted at zero opacity is not
            counted towards Largest Contentful Paint.

            The clamp's vw term and 9.5rem ceiling are unchanged, so every width
            at or above ~338px renders exactly as before — only the very
            narrowest phones get the smaller floor.
          */}
          <RevealItem variant="rise">
            <h1
              id="hero-title"
              className="mt-6 text-[clamp(3rem,13vw,9.5rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-gradient sm:mt-8 sm:leading-[0.94] sm:tracking-[-0.045em]"
            >
              {siteConfig.name}
            </h1>
          </RevealItem>

          {/*
            Roles read as a centred two-per-line list on mobile. The bullet
            separators are dropped below `sm` — at four items they wrapped into
            orphaned dots at the start of a line, which looked like a bug.
          */}
          <RevealItem variant="rise">
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[0.8125rem] font-medium tracking-tight text-ink-muted sm:mt-7 sm:gap-x-3 sm:gap-y-2 sm:text-[0.9375rem]">
              {siteConfig.roles.map((role, index) => (
                <li key={role} className="inline-flex items-center gap-2.5 sm:gap-3">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="hidden size-1 rounded-full bg-electric-400/70 sm:block"
                    />
                  ) : null}
                  <span className="rounded-full border border-hairline px-2.5 py-1 sm:border-0 sm:px-0 sm:py-0">
                    {role}
                  </span>
                </li>
              ))}
            </ul>
          </RevealItem>

          <RevealItem variant="rise">
            <p className="mt-6 max-w-[38ch] text-pretty text-[0.9375rem] leading-[1.7] text-ink-muted sm:mt-9 sm:max-w-2xl sm:leading-relaxed sm:text-base">
              I build intelligent software, automate complex workflows, research
              cybersecurity, and develop AI-powered solutions that bridge
              healthcare and modern technology. My passion is creating secure,
              efficient, and scalable systems that solve real-world problems.
            </p>
          </RevealItem>

          <RevealItem variant="slideUp" className="w-full sm:w-auto">
            {/*
              Stacked and full-width on mobile — primary first, secondary
              directly beneath — then side by side from `sm`. `max-w-sm` keeps
              them from stretching to an awkward width on large phones.
            */}
            <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-11 sm:max-w-none sm:flex-row sm:items-center">
              {/*
                Points at Current Focus rather than a project gallery, so the
                label matches where it actually goes.
              */}
              <Button
                href="#focus"
                size="lg"
                iconRight={<ArrowRightIcon />}
                className="w-full sm:w-auto"
              >
                Current Focus
              </Button>
              <Button
                href="#contact"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Contact Me
              </Button>
            </div>
          </RevealItem>

          <RevealItem variant="fadeIn">
            <div className="mt-9 flex flex-col items-center gap-4 sm:mt-14 sm:gap-6">
              <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] text-ink-faint uppercase min-[400px]:tracking-[0.14em] lg:text-[0.6875rem] lg:leading-normal">
                <MapPinIcon className="size-3.5 shrink-0" />
                Based in {siteConfig.location}
              </p>

              {/*
                The scroll cue is decorative but focusable, so its hit area is
                padded to clear 44px. The visible bar and arrow stay centred, so
                it looks identical while being far easier to hit.
                Hidden in landscape, where there is no room for it.
              */}
              <a
                href="#about"
                className="group inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-2 text-ink-faint transition-colors duration-300 max-[820px]:landscape:hidden hover:text-electric-300"
              >
                <span className="sr-only">Scroll to the about section</span>
                <span
                  aria-hidden="true"
                  className="relative flex h-9 w-6 justify-center overflow-hidden rounded-full border border-hairline sm:h-11"
                >
                  <span className="mt-1.5 h-2 w-0.5 rounded-full bg-electric-400/90 animate-scan" />
                </span>
                <ArrowDownIcon className="size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </div>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
