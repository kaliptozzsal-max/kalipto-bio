import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TagProps = {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "accent";
};

/** Compact label used for technologies and project topics. */
export function Tag({ children, className, tone = "neutral" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs leading-none font-medium whitespace-nowrap transition-colors duration-200",
        tone === "accent"
          ? "border-electric-500/30 bg-electric-500/10 text-electric-200"
          : "border-hairline bg-white/[0.035] text-ink-muted group-hover:border-hairline-strong group-hover:text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
