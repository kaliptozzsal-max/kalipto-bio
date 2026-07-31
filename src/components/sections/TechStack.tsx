import type { CSSProperties } from "react";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { techStack } from "@/data/techStack";

export function TechStack() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-title"
      className="relative scroll-mt-28 py-28 sm:py-36"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow="Tech Stack"
          id="stack-title"
          title={
            <>
              The tools I reach for <span className="text-gradient">daily</span>
            </>
          }
          subtitle="A small, well-understood stack I keep returning to as I build."
        />

        <RevealGroup
          as="ul"
          stagger={0.04}
          className="mt-16 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6"
        >
          {techStack.map((tech) => (
            <RevealItem key={tech.name} as="li" variant="scaleIn">
              <div
                style={{ "--brand": tech.color } as CSSProperties}
                className="group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl glass lit-edge transition-[border-color,transform] duration-500 ease-out hover:-translate-y-1.5 hover:border-hairline-strong"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -bottom-14 h-28 bg-[var(--brand)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                />
                <tech.Icon
                  aria-hidden="true"
                  className="size-7 text-ink-muted transition-[color,transform] duration-500 ease-out group-hover:scale-110 group-hover:text-[var(--brand)] sm:size-8"
                />
                <span className="px-1.5 text-center font-mono text-[0.625rem] leading-tight tracking-[0.08em] text-ink-faint uppercase transition-colors duration-500 group-hover:text-ink sm:text-[0.6875rem]">
                  {tech.name}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
