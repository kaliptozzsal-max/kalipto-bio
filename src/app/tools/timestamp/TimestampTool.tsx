"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToolKeyboard } from "@/components/tools/useToolKeyboard";

type Converted = {
  unix: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
};

function toConverted(date: Date): Converted {
  const unix = Math.floor(date.getTime() / 1000);
  const iso = date.toISOString();
  const utc = date.toUTCString();
  const local = date.toLocaleString();
  const diff = Date.now() - date.getTime();
  const absDiff = Math.abs(diff);
  const past = diff > 0;
  let relative: string;
  if (absDiff < 60_000) relative = "just now";
  else if (absDiff < 3_600_000) relative = `${Math.floor(absDiff / 60_000)} min ${past ? "ago" : "from now"}`;
  else if (absDiff < 86_400_000) relative = `${Math.floor(absDiff / 3_600_000)} hours ${past ? "ago" : "from now"}`;
  else relative = `${Math.floor(absDiff / 86_400_000)} days ${past ? "ago" : "from now"}`;

  return { unix, iso, utc, local, relative };
}

export function TimestampTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Converted | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setResult(null);
      setError(null);
      return;
    }

    let date: Date | null = null;

    // Try Unix timestamp (seconds or milliseconds)
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      date = new Date(num < 1e12 ? num * 1000 : num);
    } else {
      // Try ISO or other parseable date string
      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed)) date = new Date(parsed);
    }

    if (date && !Number.isNaN(date.getTime())) {
      setResult(toConverted(date));
      setError(null);
    } else {
      setError("Could not parse input. Try a Unix timestamp or ISO 8601 string.");
      setResult(null);
    }
  }, [input]);

  const now = useCallback(() => {
    const date = new Date();
    setInput(String(Math.floor(date.getTime() / 1000)));
    setResult(toConverted(date));
    setError(null);
  }, []);

  useToolKeyboard(convert);

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Convert between Unix timestamps, ISO 8601, and human-readable dates."
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
            Input (Unix timestamp or date string)
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="1700000000 or 2024-01-15T12:00:00Z"
            className="h-11 w-full rounded-lg border border-hairline bg-white/[0.03] px-4 font-mono text-[0.8125rem] text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-electric-500/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={convert}
            className="h-10 rounded-lg bg-electric-600 px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-electric-500"
          >
            Convert
          </button>
          <button
            onClick={now}
            className="h-10 rounded-lg border border-hairline bg-white/[0.03] px-4 text-[0.8125rem] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Now
          </button>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[0.8125rem] text-red-300">
            {error}
          </div>
        )}

        {result && (
          <ul className="flex flex-col gap-2" aria-label="Conversion results">
            {(Object.entries(result) as [string, string | number][]).map(([key, val]) => (
              <li key={key} className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-white/[0.02] px-4 py-2.5">
                <div className="min-w-0">
                  <span className="block text-[0.6875rem] font-medium tracking-wide text-ink-faint uppercase">{key}</span>
                  <code className="block truncate font-mono text-[0.8125rem] text-ink">{String(val)}</code>
                </div>
                <CopyButton value={String(val)} label={key} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </ToolLayout>
  );
}
