import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowDownIcon, ArrowRightIcon, MapPinIcon } from "@/components/ui/Icon";
import { siteConfig } from "@/data/site";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center pt-32 pb-24 sm:pt-36"
    >
      <Container size="wide">
        <RevealGroup stagger={0.08} className="flex flex-col items-center text-center">
          <RevealItem variant="fadeIn">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-hairline bg-white/[0.035] px-4 py-2 font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-electric-400"
              />
              Always learning · always building
            </p>
          </RevealItem>

          {/*
            `rise` moves the name without fading it. This block is the largest
            text on screen, and an element first painted at zero opacity is not
            counted towards Largest Contentful Paint.
          */}
          <RevealItem variant="rise">
            <h1
              id="hero-title"
              className="mt-8 text-[clamp(3.25rem,13vw,9.5rem)] leading-[0.94] font-semibold tracking-[-0.045em] text-gradient"
            >
              {siteConfig.name}
            </h1>
          </RevealItem>

          <RevealItem variant="rise">
            <p className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.8125rem] font-medium tracking-tight text-ink-muted sm:text-[0.9375rem]">
              {siteConfig.roles.map((role, index) => (
                <span key={role} className="inline-flex items-center gap-3">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="size-1 rounded-full bg-electric-400/70"
                    />
                  ) : null}
                  <span>{role}</span>
                </span>
              ))}
            </p>
          </RevealItem>

          <RevealItem variant="rise">
            <p className="mt-9 max-w-2xl text-pretty text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base">
              I build intelligent software, automate complex workflows, research
              cybersecurity, and develop AI-powered solutions that bridge
              healthcare and modern technology. My passion is creating secure,
              efficient, and scalable systems that solve real-world problems.
            </p>
          </RevealItem>

          <RevealItem variant="slideUp">
            <div className="mt-11 flex flex-col items-center gap-3 sm:flex-row">
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
            <div className="mt-14 flex flex-col items-center gap-6">
              <p className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase">
                <MapPinIcon className="size-3.5" />
                Based in {siteConfig.location}
              </p>

              <a
                href="#about"
                className="group inline-flex flex-col items-center gap-2 text-ink-faint transition-colors duration-300 hover:text-electric-300"
              >
                <span className="sr-only">Scroll to the about section</span>
                <span
                  aria-hidden="true"
                  className="relative flex h-11 w-6 justify-center overflow-hidden rounded-full border border-hairline"
                >
                  <span className="mt-1.5 h-2 w-0.5 rounded-full bg-electric-400/90 animate-scan" />
                </span>
                <ArrowDownIcon className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </div>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
