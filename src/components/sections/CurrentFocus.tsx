import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { focusAreas } from "@/data/focus";
import { skillIcons } from "./Skills";

/**
 * What I'm actively learning and building with.
 *
 * This stands in place of a project gallery on purpose: it describes current
 * direction honestly instead of presenting work as finished or shipped.
 */
export function CurrentFocus() {
  return (
    <section
      id="focus"
      aria-labelledby="focus-title"
      className="relative scroll-mt-24 py-16 sm:py-24 lg:scroll-mt-28 lg:py-36"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow="Current Focus"
          id="focus-title"
          title={
            <>
              What I&apos;m learning and{" "}
              <span className="text-gradient">building with</span>
            </>
          }
          subtitle="The areas I'm actively working through right now. This changes as my focus does."
        />

        <RevealGroup
          as="ul"
          stagger={0.08}
          className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 md:grid-cols-2 lg:mt-16"
        >
          {focusAreas.map((area) => {
            const Icon = skillIcons[area.icon];

            return (
              <RevealItem
                key={area.id}
                as="li"
                variant="slideUp"
                className="h-full"
              >
                <GlassCard
                  className="flex h-full flex-col p-7 sm:p-8"
                  accent={area.accent}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-2xl border border-hairline-strong bg-white/[0.05] text-electric-300 transition-all duration-500 group-hover:border-electric-400/45 group-hover:bg-electric-500/12 group-hover:text-electric-200"
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-[1.125rem] font-semibold tracking-tight text-ink">
                      {area.title}
                    </h3>
                  </div>

                  <p className="mt-6 flex-1 text-[0.9375rem] leading-[1.75] text-ink-muted">
                    {area.body}
                  </p>

                  <ul
                    aria-label={`${area.title} — technologies in use`}
                    className="mt-7 flex flex-wrap gap-1.5 border-t border-hairline pt-6"
                  >
                    {area.tools.map((tool) => (
                      <li key={tool}>
                        <Tag>{tool}</Tag>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
