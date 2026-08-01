"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToolKeyboard } from "@/components/tools/useToolKeyboard";

type Hashes = {
  "SHA-1": string;
  "SHA-256": string;
  "SHA-512": string;
};

async function computeHash(algorithm: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function HashTool() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!input) {
      setHashes(null);
      return;
    }
    setLoading(true);
    try {
      const [sha1, sha256, sha512] = await Promise.all([
        computeHash("SHA-1", input),
        computeHash("SHA-256", input),
        computeHash("SHA-512", input),
      ]);
      setHashes({ "SHA-1": sha1, "SHA-256": sha256, "SHA-512": sha512 });
    } finally {
      setLoading(false);
    }
  }, [input]);

  useToolKeyboard(generate);

  return (
    <ToolLayout
      title="Hash Generator"
      description="Compute SHA-1, SHA-256, and SHA-512 hashes using the Web Crypto API. Ctrl+Enter to hash."
    >
      <ToolInput
        value={input}
        onChange={setInput}
        placeholder="Text to hash..."
        label="Input"
        rows={4}
        mono={false}
      />

      <button
        onClick={generate}
        disabled={loading}
        className="mt-4 h-10 rounded-lg bg-electric-600 px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-electric-500 disabled:opacity-50"
      >
        {loading ? "Hashing..." : "Generate Hashes"}
      </button>

      {hashes && (
        <ul className="mt-6 flex flex-col gap-3" aria-label="Hash results">
          {(Object.entries(hashes) as [string, string][]).map(([algo, hash]) => (
            <li key={algo} className="rounded-xl border border-hairline bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">{algo}</span>
                <CopyButton value={hash} label={algo} />
              </div>
              <code className="mt-2 block break-all font-mono text-[0.75rem] leading-relaxed text-ink">
                {hash}
              </code>
            </li>
          ))}
        </ul>
      )}
    </ToolLayout>
  );
}
