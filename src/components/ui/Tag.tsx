import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TagProps = {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "accent";
};

/** Small pill used for tech stacks and topic labels. */
export function Tag({ children, className, tone = "neutral" }: TagProps) {
  return (
    <span
      className={cn(
        // 12px on mobile for legibility (11px trips Lighthouse's legible-text
        // audit and is genuinely hard to read at arm's length); the original
        // 11px is pinned from `lg` so desktop is unchanged.
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs leading-none tracking-wide whitespace-nowrap transition-colors duration-300 lg:text-[0.6875rem]",
        tone === "accent"
          ? "border-electric-500/30 bg-electric-500/10 text-electric-200"
          : "border-hairline bg-white/[0.03] text-ink-muted group-hover:border-hairline-strong group-hover:text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
