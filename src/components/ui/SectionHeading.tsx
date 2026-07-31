import type { ReactNode } from "react";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Small mono eyebrow above the title. */
  eyebrow?: string;
  title: ReactNode;
  /** Short descriptive subtitle below the title. */
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h2" | "h3";
  id?: string;
};

/**
 * Consistent section header: eyebrow, large title, small subtitle. Every
 * section uses this so vertical rhythm and hierarchy never drift.
 */
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
        "flex flex-col gap-5",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <RevealItem variant="fadeIn">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-hairline bg-white/[0.04] px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.18em] text-electric-300 uppercase">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-electric-400"
            />
            {eyebrow}
          </span>
        </RevealItem>
      ) : null}

      <RevealItem variant="blurReveal">
        <Tag
          id={id}
          className="max-w-3xl text-[2rem] leading-[1.12] font-semibold text-balance sm:text-[2.5rem] lg:text-[3rem]"
        >
          {title}
        </Tag>
      </RevealItem>

      {subtitle ? (
        <RevealItem variant="slideUp">
          <p
            className={cn(
              "text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base",
              centered ? "mx-auto max-w-2xl" : "max-w-2xl",
            )}
          >
            {subtitle}
          </p>
        </RevealItem>
      ) : null}
    </RevealGroup>
  );
}
