"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToolKeyboard } from "@/components/tools/useToolKeyboard";
import { cn } from "@/lib/utils";

export function JsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const format = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input]);

  useToolKeyboard(format);

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, minify, and validate JSON with syntax highlighting. Ctrl+Enter to format."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder='{"key": "value"}'
            label="Input JSON"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={format}
              className="h-10 rounded-lg bg-electric-600 px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-electric-500"
            >
              Format
            </button>
            <button
              onClick={minify}
              className="h-10 rounded-lg border border-hairline bg-white/[0.03] px-4 text-[0.8125rem] font-medium text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
            >
              Minify
            </button>
            <label className="ml-auto flex items-center gap-2 text-[0.75rem] text-ink-faint">
              Indent
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="h-8 rounded-lg border border-hairline bg-white/[0.03] px-2 text-[0.75rem] text-ink outline-none"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={1}>1 tab</option>
              </select>
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
              Output
            </span>
            {output && <CopyButton value={output} />}
          </div>
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 font-mono text-[0.8125rem] leading-relaxed text-red-300"
            >
              {error}
            </div>
          ) : (
            <pre
              className={cn(
                "min-h-[8rem] overflow-auto rounded-xl border border-hairline bg-white/[0.02] p-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-all text-ink",
                !output && "text-ink-faint italic",
              )}
            >
              {output || "Formatted JSON will appear here..."}
            </pre>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
