"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

type ToolOutputProps = {
  value: string;
  label?: string;
  error?: string | null;
  mono?: boolean;
  children?: ReactNode;
  className?: string;
};

/**
 * Styled output pane with a copy button. Shows an error state when `error` is set.
 */
export function ToolOutput({
  value,
  label = "Output",
  error,
  mono = true,
  children,
  className,
}: ToolOutputProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
          {label}
        </span>
        {value && !error && <CopyButton value={value} label={label} />}
      </div>
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[0.8125rem] leading-relaxed text-red-300"
        >
          {error}
        </div>
      ) : children ? (
        children
      ) : (
        <pre
          className={cn(
            "min-h-[8rem] overflow-auto rounded-xl border border-hairline bg-white/[0.02] p-4 text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-all text-ink",
            mono && "font-mono",
            !value && "text-ink-faint italic",
          )}
        >
          {value || "Output will appear here..."}
        </pre>
      )}
    </div>
  );
}
