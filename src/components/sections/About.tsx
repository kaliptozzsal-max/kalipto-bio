import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brandValues } from "@/data/site";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative scroll-mt-24 py-16 sm:py-24 lg:scroll-mt-28 lg:py-36"
    >
      <Container>
        <SectionHeading
          eyebrow="About"
          id="about-title"
          title={
            <>
              About <span className="text-gradient">Kalipto</span>
            </>
          }
          subtitle="A short introduction to how I work and what keeps me interested."
        />

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Reveal variant="blurReveal">
            <GlassCard
              interactive={false}
              className="h-full p-8 sm:p-10"
              accent="from-electric-500/12 via-electric-500/4 to-transparent"
            >
              <div className="space-y-6 text-[0.9375rem] leading-relaxed text-ink-muted sm:text-[1.0625rem] sm:leading-[1.75]">
                <p>
                  I am a technology enthusiast passionate about cybersecurity,
                  artificial intelligence, automation, and software engineering.
                  My work combines modern development practices with continuous
                  research into security, cloud infrastructure, and intelligent
                  systems.
                </p>
                <p>
                  I enjoy building AI applications, APIs, automation platforms,
                  developer tools, and solutions for healthcare technology. I
                  believe technology should simplify complex problems while
                  remaining secure, reliable, and user-focused.
                </p>
              </div>
            </GlassCard>
          </Reveal>

          <RevealGroup
            as="ul"
            stagger={0.06}
            className="grid gap-4 sm:grid-cols-2"
          >
            {brandValues.map((value) => (
              <RevealItem
                key={value.title}
                as="li"
                variant="slideUp"
                className="h-full"
              >
                <GlassCard className="flex h-full flex-col p-5">
                  <h3 className="text-[0.9375rem] font-semibold tracking-tight text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                    {value.body}
                  </p>
                </GlassCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
