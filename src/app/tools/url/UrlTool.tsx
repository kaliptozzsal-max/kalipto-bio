"use client";

import { useCallback, useState } from "react";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolOutput } from "@/components/tools/ToolOutput";
import { useToolKeyboard } from "@/components/tools/useToolKeyboard";

export function UrlTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [component, setComponent] = useState(true);

  const execute = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (mode === "encode") {
        setOutput(component ? encodeURIComponent(input) : encodeURI(input));
      } else {
        setOutput(component ? decodeURIComponent(input) : decodeURI(input));
      }
      setError(null);
    } catch {
      setError("Invalid input for the selected operation.");
      setOutput("");
    }
  }, [input, mode, component]);

  useToolKeyboard(execute);

  return (
    <ToolLayout
      title="URL Encoder/Decoder"
      description="Encode and decode URLs and URI components."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <ModeBtn active={mode === "encode"} onClick={() => setMode("encode")}>Encode</ModeBtn>
        <ModeBtn active={mode === "decode"} onClick={() => setMode("decode")}>Decode</ModeBtn>
        <label className="ml-4 flex items-center gap-2 text-[0.8125rem] text-ink-muted">
          <input
            type="checkbox"
            checked={component}
            onChange={(e) => setComponent(e.target.checked)}
            className="size-4 rounded border-hairline accent-electric-500"
          />
          Component only
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ToolInput value={input} onChange={setInput} placeholder="https://example.com/path?q=hello world" label="Input" mono={false} />
          <button
            onClick={execute}
            className="h-10 w-fit rounded-lg bg-electric-600 px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-electric-500"
          >
            {mode === "encode" ? "Encode" : "Decode"}
          </button>
        </div>
        <ToolOutput value={output} error={error} mono={false} />
      </div>
    </ToolLayout>
  );
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 rounded-lg border px-4 text-[0.8125rem] font-medium transition-all duration-300 ${
        active ? "border-electric-500/30 bg-electric-500/12 text-electric-200" : "border-hairline bg-white/[0.03] text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
