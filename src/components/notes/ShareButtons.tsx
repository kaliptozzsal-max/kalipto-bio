"use client";

import { useCallback, useState } from "react";

/**
 * Share buttons for a note. Uses Web Share API when available,
 * falls back to copy-link and social links.
 */
export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const share = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch { /* user cancelled or unsupported */ }
    }
    copyLink();
  }, [title, url, copyLink]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <span className="text-[0.75rem] font-medium text-ink-faint uppercase tracking-wide">
        Share
      </span>
      <button
        onClick={share}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline bg-white/[0.03] px-2.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        {copied ? "Copied!" : "Link"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center rounded-lg border border-hairline bg-white/[0.03] px-2.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center rounded-lg border border-hairline bg-white/[0.03] px-2.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        LinkedIn
      </a>
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center rounded-lg border border-hairline bg-white/[0.03] px-2.5 text-[0.75rem] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        Telegram
      </a>
    </div>
  );
}
