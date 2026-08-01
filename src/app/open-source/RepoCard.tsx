"use client";

import { useCallback, useState } from "react";
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ExternalLinkIcon, ForkIcon, StarIcon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { languageColor, relativeTime, type FullRepo } from "@/lib/github";
import { cn } from "@/lib/utils";

/**
 * A single repository card for the open-source hub.
 *
 * Shows: name, description, language, stars, forks, license, topics,
 * last updated, live demo link, clone URL with copy button.
 * Featured repos get an accent gradient wash.
 */
export function RepoCard({
  repo,
  featured = false,
}: {
  repo: FullRepo;
  featured?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyCloneUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(repo.cloneUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select + copy for older browsers
      const input = document.createElement("input");
      input.value = repo.cloneUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [repo.cloneUrl]);

  return (
    <GlassCard
      as="article"
      className="flex h-full flex-col p-6 sm:p-7"
      accent={featured ? "from-electric-500/20 to-cyber-cyan/10" : undefined}
    >
      {/* Header: name + stats */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] leading-snug font-semibold tracking-tight text-ink">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words transition-colors duration-300 hover:text-electric-200"
            >
              {repo.name}
            </a>
          </h3>
          {repo.archived && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 font-mono text-[0.625rem] tracking-wide text-amber-300 uppercase">
              Archived
            </span>
          )}
        </div>

        <div
          aria-hidden="true"
          className="flex shrink-0 items-center gap-3 pt-0.5 font-mono text-[0.6875rem] text-ink-faint"
        >
          {repo.stars > 0 && (
            <span className="inline-flex items-center gap-1">
              <StarIcon className="size-3.5" />
              {repo.stars}
            </span>
          )}
          {repo.forks > 0 && (
            <span className="inline-flex items-center gap-1">
              <ForkIcon className="size-3.5" />
              {repo.forks}
            </span>
          )}
        </div>
      </div>

      {/* Screen reader text for stats */}
      {(repo.stars > 0 || repo.forks > 0) && (
        <p className="sr-only">
          {repo.stars} stars, {repo.forks} forks
        </p>
      )}

      {/* Description */}
      <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-ink-muted">
        {repo.description ?? (
          <span className="text-ink-faint italic">No description on GitHub yet.</span>
        )}
      </p>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <ul aria-label={`${repo.name} topics`} className="mt-5 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 5).map((topic) => (
            <li key={topic}>
              <Tag>{topic}</Tag>
            </li>
          ))}
          {repo.topics.length > 5 && (
            <li>
              <Tag className="text-ink-faint">+{repo.topics.length - 5}</Tag>
            </li>
          )}
        </ul>
      )}

      {/* Metadata row: language, license, updated */}
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-hairline pt-5 font-mono text-[0.6875rem] text-ink-faint">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: languageColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        {repo.licenseSpdx && repo.licenseSpdx !== "NOASSERTION" && (
          <span className="inline-flex items-center gap-1">
            <LicenseIcon className="size-3" />
            {repo.licenseSpdx}
          </span>
        )}
        <span>Updated {relativeTime(repo.pushedAt)}</span>
      </div>

      {/* Action row: source, demo, clone */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button
          href={repo.url}
          external
          variant="secondary"
          size="sm"
          iconLeft={<SiGithub />}
          ariaLabel={`View ${repo.name} source on GitHub`}
        >
          Source
        </Button>

        {repo.demoUrl && (
          <Button
            href={repo.demoUrl}
            external
            variant="ghost"
            size="sm"
            iconRight={<ExternalLinkIcon />}
            ariaLabel={`Open ${repo.name} live demo`}
          >
            Demo
          </Button>
        )}

        <button
          onClick={copyCloneUrl}
          aria-label={copied ? "Clone URL copied" : `Copy clone URL for ${repo.name}`}
          className={cn(
            "ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[0.75rem] font-medium transition-all duration-300 lg:h-8",
            copied
              ? "border-electric-500/30 bg-electric-500/10 text-electric-200"
              : "border-hairline bg-white/[0.03] text-ink-faint hover:border-hairline-strong hover:text-ink",
          )}
        >
          {copied ? (
            <>
              <CheckIcon className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <ClipboardIcon className="size-3.5" />
              Clone
            </>
          )}
        </button>
      </div>
    </GlassCard>
  );
}

// ── Inline icons ────────────────────────────────────────────────────────────

function LicenseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3v4m0 14v-4m9-5h-4M7 12H3" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="9" y="2.5" width="6" height="4" rx="1" />
      <path d="M9 4.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-13a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
