"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToolKeyboard } from "@/components/tools/useToolKeyboard";

export function RegexTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("");

  const { matches, error } = useMemo(() => {
    if (!pattern || !testStr) return { matches: [], error: null };
    try {
      const re = new RegExp(pattern, flags);
      const results: { index: number; text: string; groups: string[] }[] = [];
      let m: RegExpExecArray | null;
      if (flags.includes("g")) {
        while ((m = re.exec(testStr)) !== null) {
          results.push({ index: m.index, text: m[0], groups: m.slice(1) });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        m = re.exec(testStr);
        if (m) results.push({ index: m.index, text: m[0], groups: m.slice(1) });
      }
      return { matches: results, error: null };
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : "Invalid regex" };
    }
  }, [pattern, flags, testStr]);

  const execute = useCallback(() => {
    // Matches are already reactive — keyboard shortcut is a no-op placeholder
  }, []);

  useToolKeyboard(execute);

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions with live match highlighting and capture groups."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
              Pattern
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="[a-z]+"
              spellCheck={false}
              className="h-10 w-full rounded-lg border border-hairline bg-white/[0.03] px-3 font-mono text-[0.8125rem] text-ink outline-none transition-colors focus:border-electric-500/40"
            />
          </div>
          <div className="w-24">
            <label className="mb-1.5 block text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
              Flags
            </label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gim"
              className="h-10 w-full rounded-lg border border-hairline bg-white/[0.03] px-3 font-mono text-[0.8125rem] text-ink outline-none transition-colors focus:border-electric-500/40"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[0.8125rem] text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
            Test String
          </label>
          <textarea
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            rows={6}
            placeholder="Enter text to test against..."
            spellCheck={false}
            className="min-h-[8rem] w-full resize-y rounded-xl border border-hairline bg-white/[0.03] p-4 font-mono text-[0.8125rem] leading-relaxed text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-electric-500/40"
          />
        </div>

        {matches.length > 0 && (
          <div>
            <span className="text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
            <ul className="mt-2 flex flex-col gap-1.5" aria-label="Regex matches">
              {matches.map((m, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-hairline bg-white/[0.02] px-3 py-2 font-mono text-[0.75rem]"
                >
                  <span className="text-ink-faint">#{i + 1}</span>
                  <span className="text-electric-200">&quot;{m.text}&quot;</span>
                  <span className="text-ink-faint">@{m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="text-ink-muted">
                      groups: [{m.groups.map((g) => `"${g}"`).join(", ")}]
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
