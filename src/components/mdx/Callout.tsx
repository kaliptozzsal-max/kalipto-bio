"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "danger" | "tip";

const styles: Record<CalloutType, { border: string; bg: string; icon: string; title: string }> = {
  info: {
    border: "border-electric-500/30",
    bg: "bg-electric-500/5",
    icon: "ℹ",
    title: "text-electric-200",
  },
  tip: {
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    icon: "💡",
    title: "text-green-200",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    icon: "⚠",
    title: "text-amber-200",
  },
  danger: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    icon: "🚨",
    title: "text-red-200",
  },
};

/**
 * Callout block for notes. Used as:
 *
 * ```mdx
 * <Callout type="warning" title="Heads up">
 *   Content here...
 * </Callout>
 * ```
 */
export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const s = styles[type];
  return (
    <aside
      role="note"
      className={cn(
        "mt-6 rounded-xl border p-5",
        s.border,
        s.bg,
      )}
    >
      {title && (
        <p className={cn("mb-2 flex items-center gap-2 text-[0.875rem] font-semibold", s.title)}>
          <span aria-hidden="true">{s.icon}</span>
          {title}
        </p>
      )}
      <div className="text-[0.9375rem] leading-relaxed text-ink-muted [&>p]:mt-2 [&>p:first-child]:mt-0">
        {children}
      </div>
    </aside>
  );
}
