import type { ReactNode } from "react";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h2" | "h3";
  id?: string;
};

/** Consistent editorial hierarchy shared by every section. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  as: Tag = "h2",
  id,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <RevealGroup
      stagger={0.06}
      className={cn(
        "flex flex-col gap-3.5 sm:gap-4",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <RevealItem variant="fadeIn">
          <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-electric-300 uppercase">
            <span
              aria-hidden="true"
              className="h-px w-7 bg-gradient-to-r from-electric-500 to-electric-300"
            />
            {eyebrow}
            {centered ? (
              <span
                aria-hidden="true"
                className="h-px w-7 bg-gradient-to-l from-electric-500 to-electric-300"
              />
            ) : null}
          </span>
        </RevealItem>
      ) : null}

      <RevealItem variant="blurReveal">
        <Tag
          id={id}
          className="cyber-heading max-w-4xl text-[clamp(2rem,6.4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance"
        >
          {title}
        </Tag>
      </RevealItem>

      {subtitle ? (
        <RevealItem variant="slideUp">
          <p
            className={cn(
              "text-[0.9375rem] leading-[1.75] text-pretty text-ink-muted sm:text-base",
              centered ? "mx-auto max-w-xl" : "max-w-xl",
            )}
          >
            {subtitle}
          </p>
        </RevealItem>
      ) : null}
    </RevealGroup>
  );
}
