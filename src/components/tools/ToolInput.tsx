"use client";

import { cn } from "@/lib/utils";

type ToolInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  mono?: boolean;
  className?: string;
};

/**
 * Styled textarea input for tools. Auto-sizing with minimum height.
 */
export function ToolInput({
  value,
  onChange,
  placeholder = "Paste your input here...",
  label = "Input",
  rows = 6,
  mono = true,
  className,
}: ToolInputProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        className={cn(
          "min-h-[8rem] resize-y rounded-xl border border-hairline bg-white/[0.03] p-4 text-[0.8125rem] leading-relaxed text-ink placeholder:text-ink-faint outline-none transition-colors duration-300 focus:border-electric-500/40 focus:bg-white/[0.05]",
          mono && "font-mono",
        )}
      />
    </div>
  );
}
