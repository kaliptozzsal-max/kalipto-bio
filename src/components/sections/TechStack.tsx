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
      className="relative scroll-mt-24 py-16 sm:py-24 lg:scroll-mt-28 lg:py-36"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow="Tech Stack"
          id="stack-title"
          title={
            <>
              Tools chosen for <span className="text-gradient">real work</span>
            </>
          }
          subtitle="A focused, dependable stack for building secure and useful products."
        />

        <RevealGroup
          as="ul"
          stagger={0.04}
          className="mt-10 grid grid-cols-3 gap-2.5 sm:mt-14 sm:grid-cols-4 sm:gap-4 lg:mt-16 lg:grid-cols-6"
        >
          {techStack.map((tech) => (
            <RevealItem key={tech.name} as="li" variant="scaleIn">
              <div
                style={{ "--brand": tech.color } as CSSProperties}
                className="group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-hairline bg-void-900/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-lg transition-[border-color,transform,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-hairline-strong hover:bg-void-850/80"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-4 -bottom-12 h-24 bg-[var(--brand)] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
                />
                <tech.Icon
                  aria-hidden="true"
                  className="size-7 text-ink-muted transition-[color,transform] duration-300 ease-out group-hover:scale-105 group-hover:text-[var(--brand)] sm:size-8"
                />
                <span className="px-1 text-center text-xs leading-tight font-medium text-ink-faint transition-colors duration-300 group-hover:text-ink sm:px-1.5">
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
