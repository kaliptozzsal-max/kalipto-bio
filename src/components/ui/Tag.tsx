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
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] leading-none tracking-wide whitespace-nowrap transition-colors duration-300",
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
