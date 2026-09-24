import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
  /** Hover lift and accent ring. Turn off for static panels. */
  interactive?: boolean;
  /** Optional brand wash behind the content. */
  accent?: string;
};

/** A quiet elevated surface shared by the homepage sections. */
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
        "cyber-card group relative isolate overflow-hidden rounded-2xl glass lit-edge",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-300 ease-out lg:will-change-transform lg:hover:-translate-y-1 lg:hover:border-electric-500/30 lg:hover:shadow-[0_24px_60px_-36px_rgba(201,31,54,0.48)]",
        className,
      )}
    >
      {accent ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-28 left-1/2 -z-10 h-56 w-[120%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b opacity-35 blur-3xl transition-opacity duration-500 group-hover:opacity-55",
            accent,
          )}
        />
      ) : null}
      {children}
    </Tag>
  );
}
