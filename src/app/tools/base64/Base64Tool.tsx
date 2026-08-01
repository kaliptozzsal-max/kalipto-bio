"use client";

import { useCallback, useState } from "react";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolOutput } from "@/components/tools/ToolOutput";
import { useToolKeyboard } from "@/components/tools/useToolKeyboard";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const execute = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
      setError(null);
    } catch {
      setError(mode === "decode" ? "Invalid Base64 string." : "Failed to encode input.");
      setOutput("");
    }
  }, [input, mode]);

  useToolKeyboard(execute);

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode and decode Base64 strings. Supports UTF-8 text."
    >
      <div className="mb-4 flex gap-2">
        <ModeButton active={mode === "encode"} onClick={() => setMode("encode")}>Encode</ModeButton>
        <ModeButton active={mode === "decode"} onClick={() => setMode("decode")}>Decode</ModeButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder={mode === "encode" ? "Text to encode..." : "Base64 string to decode..."}
            label="Input"
          />
          <button
            onClick={execute}
            className="h-10 w-fit rounded-lg bg-electric-600 px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-electric-500"
          >
            {mode === "encode" ? "Encode" : "Decode"}
          </button>
        </div>
        <ToolOutput value={output} error={error} />
      </div>
    </ToolLayout>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 rounded-lg border px-4 text-[0.8125rem] font-medium transition-all duration-300 ${
        active
          ? "border-electric-500/30 bg-electric-500/12 text-electric-200"
          : "border-hairline bg-white/[0.03] text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
