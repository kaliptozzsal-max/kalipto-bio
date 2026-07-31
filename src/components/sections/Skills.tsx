import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  BrainIcon,
  CloudIcon,
  CodeIcon,
  PulseIcon,
  ShieldIcon,
} from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { skillCategories, type SkillIcon } from "@/data/skills";

export const skillIcons: Record<SkillIcon, typeof ShieldIcon> = {
  shield: ShieldIcon,
  brain: BrainIcon,
  code: CodeIcon,
  cloud: CloudIcon,
  pulse: PulseIcon,
};

export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="relative scroll-mt-28 py-28 sm:py-36"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow="Skills"
          id="skills-title"
          title={
            <>
              Technologies I work <span className="text-gradient">with</span>
            </>
          }
          subtitle="Grouped by area rather than ranked — this is where my attention goes, not a claim about levels."
        />

        <RevealGroup
          as="ul"
          stagger={0.07}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {skillCategories.map((category) => {
            const Icon = skillIcons[category.icon];

            return (
              <RevealItem
                key={category.title}
                as="li"
                variant="slideUp"
                className="h-full"
              >
                <GlassCard
                  className="flex h-full flex-col p-6 sm:p-7"
                  accent={category.accent}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      aria-hidden="true"
                      className="grid size-11 place-items-center rounded-2xl border border-hairline-strong bg-white/[0.05] text-electric-300 transition-all duration-500 group-hover:border-electric-400/45 group-hover:bg-electric-500/12 group-hover:text-electric-200"
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-[1.0625rem] font-semibold tracking-tight text-ink">
                      {category.title}
                    </h3>
                  </div>

                  <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-hairline pt-7">
                    {category.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-ink-muted transition-colors duration-300 group-hover:text-ink/90"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.5rem] size-1.5 shrink-0 rotate-45 bg-electric-400/60 transition-colors duration-300 group-hover:bg-electric-400"
                        />
                        <span>{item}</span>
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
