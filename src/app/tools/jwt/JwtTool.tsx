"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToolKeyboard } from "@/components/tools/useToolKeyboard";

type DecodedJwt = {
  header: string;
  payload: string;
  signature: string;
  expired: boolean | null;
  expiresAt: string | null;
  issuedAt: string | null;
};

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

function decodeToken(token: string): DecodedJwt | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;

  try {
    const header = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
    const payloadRaw = JSON.parse(base64UrlDecode(parts[1]));
    const payload = JSON.stringify(payloadRaw, null, 2);
    const signature = parts[2];

    let expired: boolean | null = null;
    let expiresAt: string | null = null;
    let issuedAt: string | null = null;

    if (typeof payloadRaw.exp === "number") {
      expiresAt = new Date(payloadRaw.exp * 1000).toISOString();
      expired = Date.now() > payloadRaw.exp * 1000;
    }
    if (typeof payloadRaw.iat === "number") {
      issuedAt = new Date(payloadRaw.iat * 1000).toISOString();
    }

    return { header, payload, signature, expired, expiresAt, issuedAt };
  } catch {
    return null;
  }
}

export function JwtTool() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setDecoded(null);
      setError(null);
      return;
    }
    const result = decodeToken(input);
    if (result) {
      setDecoded(result);
      setError(null);
    } else {
      setDecoded(null);
      setError("Invalid JWT. Expected three Base64URL-encoded parts separated by dots.");
    }
  }, [input]);

  useToolKeyboard(decode);

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode JWT tokens and inspect header, payload, and expiry. Nothing leaves your browser."
    >
      <ToolInput
        value={input}
        onChange={setInput}
        placeholder="eyJhbGciOiJIUzI1NiIs..."
        label="JWT Token"
        rows={4}
      />

      <button
        onClick={decode}
        className="mt-4 h-10 rounded-lg bg-electric-600 px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-electric-500"
      >
        Decode
      </button>

      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[0.8125rem] text-red-300">
          {error}
        </div>
      )}

      {decoded && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Section title="Header" value={decoded.header} />
          <Section title="Payload" value={decoded.payload} />
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4 text-[0.8125rem]">
              {decoded.expiresAt && (
                <span className={decoded.expired ? "text-red-300" : "text-green-300"}>
                  {decoded.expired ? "Expired" : "Valid"} — exp: {decoded.expiresAt}
                </span>
              )}
              {decoded.issuedAt && (
                <span className="text-ink-faint">iat: {decoded.issuedAt}</span>
              )}
              <span className="text-ink-faint">sig: {decoded.signature.slice(0, 20)}...</span>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

function Section({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[0.75rem] font-medium tracking-wide text-ink-faint uppercase">{title}</span>
        <CopyButton value={value} label={title} />
      </div>
      <pre className="overflow-auto rounded-xl border border-hairline bg-white/[0.02] p-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-all text-ink">
        {value}
      </pre>
    </div>
  );
}
