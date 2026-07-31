import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
  /** Hover lift and accent ring. Turn off for static panels. */
  interactive?: boolean;
  /** Gradient wash behind the content, e.g. "from-electric-500/20 ...". */
  accent?: string;
};

/**
 * The core surface: frosted glass, 24px corners, hairline border and a lit top
 * edge, lifting slightly on hover.
 *
 * The hover lift is a CSS transition rather than a Framer `whileHover`. There
 * are around thirty of these on the page, and each Framer element carries a
 * runtime instance plus its own gesture listeners; a composited CSS transform is
 * visually identical here and keeps the card a Server Component, so none of its
 * markup ships as client JavaScript.
 */
export function GlassCard({
  children,
  className,
  as: Tag = "div",
  interactive = true,
  accent,
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "group relative isolate overflow-hidden rounded-3xl glass lit-edge",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-400 ease-out will-change-transform hover:-translate-y-1.5 hover:border-electric-500/35 hover:shadow-[0_28px_70px_-34px_rgba(10,132,255,0.5)]",
        className,
      )}
    >
      {accent ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-24 left-1/2 -z-10 h-56 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
            accent,
          )}
        />
      ) : null}
      {children}
    </Tag>
  );
}
