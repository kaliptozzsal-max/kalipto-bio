"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToolKeyboard } from "@/components/tools/useToolKeyboard";

function generateUuid(): string {
  return crypto.randomUUID();
}

export function UuidTool() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>(() => [generateUuid()]);

  const generate = useCallback(() => {
    const n = Math.max(1, Math.min(100, count));
    setUuids(Array.from({ length: n }, () => generateUuid()));
  }, [count]);

  useToolKeyboard(generate);

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate cryptographically random v4 UUIDs. Ctrl+Enter to regenerate."
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={generate}
          className="h-10 rounded-lg bg-electric-600 px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-electric-500"
        >
          Generate
        </button>
        <label className="flex items-center gap-2 text-[0.8125rem] text-ink-muted">
          Count
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
            className="h-9 w-16 rounded-lg border border-hairline bg-white/[0.03] px-2 text-center font-mono text-[0.8125rem] text-ink outline-none focus:border-electric-500/40"
          />
        </label>
        <CopyButton value={uuids.join("\n")} label="Copy all" className="ml-auto" />
      </div>

      <ul className="mt-6 flex flex-col gap-1.5" aria-label="Generated UUIDs">
        {uuids.map((uuid, i) => (
          <li
            key={`${uuid}-${i}`}
            className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-white/[0.02] px-4 py-2.5"
          >
            <code className="font-mono text-[0.8125rem] text-ink break-all">{uuid}</code>
            <CopyButton value={uuid} label="UUID" />
          </li>
        ))}
      </ul>
    </ToolLayout>
  );
}
