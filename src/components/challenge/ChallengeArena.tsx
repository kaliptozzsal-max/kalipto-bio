"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  CheckCircleIcon,
  CodeIcon,
  ExternalLinkIcon,
  ShieldIcon,
  SparkIcon,
  TerminalIcon,
} from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  CIPHER_TRANSMISSION,
  EPOCH_TRANSMISSION,
  ROT13_TRANSMISSION,
  XOR_KEY_HEX,
  XOR_TRANSMISSION,
  challengeLevels,
  tierOrder,
  type ChallengeLevelId,
  type ChallengeTier,
} from "@/data/challenge";
import {
  markChallengeSolved,
  resetChallengeProgress,
  useChallengeProgress,
} from "@/lib/challenge/progress-store";
import { cn } from "@/lib/utils";
import styles from "./Challenge.module.css";

type Feedback = { tone: "success" | "error"; message: string };
type ProbeOutput = { body: string; flag: string; cookie: string };

const tierStyles: Record<ChallengeTier, string> = {
  Easy: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200",
  Medium: "border-amber-400/30 bg-amber-400/[0.08] text-amber-200",
  Hard: "border-orange-500/30 bg-orange-500/[0.08] text-orange-200",
  Insane: "border-electric-500/40 bg-electric-500/[0.1] text-electric-100",
};

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }
}

export function ChallengeArena() {
  const progress = useChallengeProgress();
  const [activeId, setActiveId] = useState<ChallengeLevelId>("source");
  const [flag, setFlag] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, setPending] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sourceOutput, setSourceOutput] = useState<string | null>(null);
  const [robotsOutput, setRobotsOutput] = useState<string | null>(null);
  const [probeOutput, setProbeOutput] = useState<ProbeOutput | null>(null);
  const [metaOutput, setMetaOutput] = useState<string | null>(null);
  const [cookieOutput, setCookieOutput] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const shareTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current !== null) {
        window.clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  const activeLevel =
    challengeLevels.find((level) => level.id === activeId) ?? challengeLevels[0];
  const solved = progress.solved.includes(activeId);
  const solvedCount = progress.solved.length;
  const totalPoints = challengeLevels.reduce((sum, level) => sum + level.points, 0);
  const earnedPoints = challengeLevels
    .filter((level) => progress.solved.includes(level.id))
    .reduce((sum, level) => sum + level.points, 0);

  function selectLevel(id: ChallengeLevelId) {
    setActiveId(id);
    setFlag("");
    setFeedback(null);
    setShowHint(false);
  }

  function runSourceScanner() {
    const marker = document.querySelector<HTMLElement>("[data-ctf-flag]");
    setSourceOutput(
      marker?.dataset.ctfFlag ?? "No training marker found in this document.",
    );
  }

  function runMetaScanner() {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="ctf-clue"]');
    setMetaOutput(meta?.content ?? "No ctf-clue meta tag found.");
  }

  async function loadRobots() {
    setFeedback(null);
    try {
      const response = await fetch("/challenge/robots.txt", { cache: "no-store" });
      if (!response.ok) throw new Error("unavailable");
      setRobotsOutput(await response.text());
    } catch {
      setFeedback({
        tone: "error",
        message: "The robots clue could not be loaded. Open the raw route directly.",
      });
    }
  }

  async function runHeaderProbe() {
    setFeedback(null);
    try {
      const response = await fetch("/api/challenge/probe", { cache: "no-store" });
      if (!response.ok) throw new Error("unavailable");
      const body = await response.text();
      let cookie = "Cookie not visible in this response.";
      try {
        const parsed = JSON.parse(body) as { cookie?: string };
        if (parsed.cookie) cookie = parsed.cookie;
      } catch {
        // Body parse is best-effort for display only.
      }
      setProbeOutput({
        body,
        flag: response.headers.get("x-kalipto-flag") ?? "Header not exposed.",
        cookie,
      });
    } catch {
      setFeedback({
        tone: "error",
        message: "The fixed sandbox probe could not be reached.",
      });
    }
  }

  async function readCookie() {
    setFeedback(null);
    // The cookie is set by the probe response, so trigger it first.
    try {
      await fetch("/api/challenge/probe", { cache: "no-store" });
    } catch {
      // Ignore; we still try to read whatever is present.
    }
    const match = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("ctf_trail="));
    setCookieOutput(
      match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "ctf_trail cookie not set yet. Run the header probe first.",
    );
  }

  async function verifyFlag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !flag.trim()) return;
    setPending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/challenge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: activeId, flag: flag.trim().toUpperCase() }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setFeedback({ tone: "error", message: result.message ?? "Flag rejected." });
        return;
      }

      markChallengeSolved(activeId);
      setFeedback({
        tone: "success",
        message: `${activeLevel.name} solved. +${activeLevel.points} points.`,
      });
      setFlag("");
    } catch {
      setFeedback({
        tone: "error",
        message: "Verification is temporarily unavailable.",
      });
    } finally {
      setPending(false);
    }
  }

  async function shareChallenge() {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Kalipto Breach Challenge",
          text: "Can you capture all ten fictional CTF flags?",
          url,
        });
        setShareStatus("Challenge link shared.");
      } else {
        const copied = await copyText(url);
        setShareStatus(copied ? "Challenge link copied." : "Long-press the URL to copy it.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const copied = await copyText(url);
      setShareStatus(copied ? "Challenge link copied." : "Long-press the URL to copy it.");
    }

    if (shareTimerRef.current !== null) window.clearTimeout(shareTimerRef.current);
    shareTimerRef.current = window.setTimeout(() => setShareStatus(null), 2500);
  }

  function reset() {
    if (window.confirm("Reset all local challenge progress?")) {
      resetChallengeProgress();
      setActiveId("source");
      setFlag("");
      setFeedback(null);
    }
  }

  function moveToNext() {
    const index = challengeLevels.findIndex((level) => level.id === activeId);
    const next = challengeLevels[index + 1];
    if (next) selectLevel(next.id);
  }

  return (
    <div className={`${styles.challengeRoot} relative pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36`}>
      <Container size="wide">
        <SectionHeading
          eyebrow="Isolated CTF · 10 levels"
          align="left"
          title={
            <>
              Kalipto <span className="text-gradient">Breach Challenge</span>
            </>
          }
          subtitle="Hack the fictional sandbox—not the real portfolio. Ten harmless flags across Easy, Medium, Hard, and Insane tiers."
        />

        <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.055] p-4 text-sm leading-relaxed text-ink-muted">
            <ShieldIcon className="mt-0.5 size-5 shrink-0 text-emerald-300" />
            <p>
              <strong className="text-ink">Safe training boundary:</strong> fixed
              fictional data only. No real command execution, account access,
              filesystem, database, target scanning, or outbound network requests.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => void shareChallenge()} variant="secondary">
              Share challenge
            </Button>
            {solvedCount > 0 ? (
              <Button onClick={reset} variant="ghost">
                Reset progress
              </Button>
            ) : null}
          </div>
        </div>

        <p role="status" aria-live="polite" className="mt-2 min-h-5 text-right text-xs text-electric-200">
          {shareStatus ?? ""}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-4 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-faint uppercase">
            <span>Breach progress · {earnedPoints}/{totalPoints} pts</span>
            <span>{solvedCount}/{challengeLevels.length} flags</span>
          </div>
          <div
            role="progressbar"
            aria-label="Challenge progress"
            aria-valuemin={0}
            aria-valuemax={challengeLevels.length}
            aria-valuenow={solvedCount}
            className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
          >
            <span
              className="block h-full rounded-full bg-gradient-to-r from-electric-800 via-electric-500 to-electric-200 shadow-[0_0_14px_rgba(229,45,67,0.65)] transition-[width] duration-500"
              style={{ width: `${(solvedCount / challengeLevels.length) * 100}%` }}
            />
          </div>
        </div>

        {progress.completed ? (
          <section className={`${styles.completed} mt-8 rounded-2xl border border-electric-500/30 p-7 text-center sm:p-10`}>
            <span className="relative mx-auto grid size-16 place-items-center rounded-2xl border border-electric-500/40 bg-electric-500/10 text-electric-100 shadow-[0_0_46px_-12px_rgba(229,45,67,0.9)]">
              <SparkIcon className="size-8" />
            </span>
            <p className="relative mt-5 font-mono text-xs font-semibold tracking-[0.18em] text-electric-300 uppercase">
              All flags captured
            </p>
            <h2 className="relative mt-2 text-3xl font-semibold text-ink">
              Red Ghost operation complete
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
              You cleared all {challengeLevels.length} levels for {totalPoints} points. No real access was granted and no system was modified.
            </p>
          </section>
        ) : null}

        <div className={`${styles.arena} mt-8 grid grid-cols-1 lg:grid-cols-[19rem_minmax(0,1fr)]`}>
          <nav aria-label="Challenge levels" className="border-b border-hairline p-3 lg:border-r lg:border-b-0">
            {tierOrder.map((tier) => {
              const tierLevels = challengeLevels.filter((level) => level.tier === tier);
              return (
                <div key={tier} className="mb-3 last:mb-0">
                  <p className="px-2 pt-2 pb-1.5 font-mono text-[0.625rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                    {tier}
                  </p>
                  <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    {tierLevels.map((level) => {
                      const isActive = level.id === activeId;
                      const isSolved = progress.solved.includes(level.id);
                      return (
                        <li key={level.id}>
                          <button
                            type="button"
                            onClick={() => selectLevel(level.id)}
                            aria-current={isActive ? "step" : undefined}
                            className={cn(
                              "flex min-h-16 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                              isActive
                                ? `${styles.activeLevel} border-electric-500/25 bg-electric-500/[0.07] text-ink`
                                : "border-transparent text-ink-muted hover:border-hairline hover:bg-white/[0.025] hover:text-ink",
                            )}
                          >
                            <span className="font-mono text-[0.6875rem] text-electric-300">
                              {level.number}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">{level.name}</span>
                              <span className="mt-0.5 block text-[0.625rem] text-ink-faint">
                                {level.points} pts
                              </span>
                            </span>
                            {isSolved ? (
                              <CheckCircleIcon className="size-4 shrink-0 text-emerald-300" />
                            ) : (
                              <span aria-hidden="true" className="size-1.5 rounded-full bg-electric-500/45" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </nav>

          <section aria-labelledby="level-title" className="min-w-0 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-md border px-2 py-1 text-[0.625rem] font-semibold tracking-[0.08em] uppercase", tierStyles[activeLevel.tier])}>
                    {activeLevel.tier}
                  </span>
                  <span className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-electric-300 uppercase">
                    {`Level ${activeLevel.number} · ${activeLevel.points} pts`}
                  </span>
                </div>
                <h2 id="level-title" className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                  {activeLevel.name}
                </h2>
              </div>
              {solved ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-2 text-xs font-semibold text-emerald-300">
                  <CheckCircleIcon className="size-4" /> Solved
                </span>
              ) : (
                <span className={`${styles.flagPulse} rounded-lg border border-electric-500/25 bg-electric-500/[0.06] px-3 py-2 font-mono text-[0.625rem] text-electric-200`}>
                  FLAG PENDING
                </span>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-ink-muted">
              {activeLevel.briefing}
            </p>
            <div className="mt-4 rounded-xl border border-hairline bg-white/[0.025] p-4">
              <p className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-faint uppercase">
                Objective
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">{activeLevel.objective}</p>
            </div>

            <div className="mt-5">
              {activeId === "source" ? (
                <div>
                  <Button onClick={runSourceScanner} iconLeft={<TerminalIcon />} variant="secondary">
                    Run phone DOM scanner
                  </Button>
                  {sourceOutput ? (
                    <pre className={`${styles.terminalOutput} mt-3 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-electric-200`}>
                      data-ctf-flag=&quot;{sourceOutput}&quot;
                    </pre>
                  ) : null}
                </div>
              ) : null}

              {activeId === "robots" ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => void loadRobots()} variant="secondary" iconLeft={<TerminalIcon />}>
                      Load robots clue
                    </Button>
                    <Button href="/challenge/robots.txt" external variant="ghost" iconRight={<ExternalLinkIcon />}>
                      Open raw text
                    </Button>
                  </div>
                  {robotsOutput ? (
                    <pre className={`${styles.terminalOutput} p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-muted`}>
                      {robotsOutput}
                    </pre>
                  ) : null}
                </div>
              ) : null}

              {activeId === "cipher" ? (
                <div>
                  <p className="overflow-x-auto rounded-xl border border-electric-500/20 bg-black/40 p-4 font-mono text-sm tracking-[0.08em] text-electric-100">
                    {CIPHER_TRANSMISSION}
                  </p>
                  <Link href="/tools/base64" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-electric-200 transition-colors hover:text-electric-100">
                    <CodeIcon className="size-4" /> Open local Base64 tool
                  </Link>
                </div>
              ) : null}

              {activeId === "header" ? (
                <div>
                  <Button onClick={() => void runHeaderProbe()} variant="secondary" iconLeft={<TerminalIcon />}>
                    Run fixed header probe
                  </Button>
                  {probeOutput ? (
                    <div className={`${styles.terminalOutput} mt-3 space-y-2 p-4 font-mono text-xs leading-relaxed`}>
                      <p className="text-ink-faint">GET /api/challenge/probe → 200</p>
                      <p className="break-all text-electric-200">X-Kalipto-Flag: {probeOutput.flag}</p>
                      <p className="break-all text-ink-muted">BODY: {probeOutput.body}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activeId === "cookie" ? (
                <div>
                  <Button onClick={() => void readCookie()} variant="secondary" iconLeft={<TerminalIcon />}>
                    Read training cookie
                  </Button>
                  {cookieOutput ? (
                    <pre className={`${styles.terminalOutput} mt-3 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all text-electric-200`}>
                      ctf_trail = {cookieOutput}
                    </pre>
                  ) : null}
                </div>
              ) : null}

              {activeId === "meta" ? (
                <div>
                  <Button onClick={runMetaScanner} variant="secondary" iconLeft={<TerminalIcon />}>
                    Scan page metadata
                  </Button>
                  {metaOutput ? (
                    <pre className={`${styles.terminalOutput} mt-3 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all text-electric-200`}>
                      &lt;meta name=&quot;ctf-clue&quot; content=&quot;{metaOutput}&quot;&gt;
                    </pre>
                  ) : null}
                </div>
              ) : null}

              {activeId === "rot13" ? (
                <div>
                  <p className="overflow-x-auto rounded-xl border border-electric-500/20 bg-black/40 p-4 font-mono text-sm tracking-[0.08em] text-electric-100">
                    {ROT13_TRANSMISSION}
                  </p>
                  <p className="mt-2 text-xs text-ink-faint">
                    Apply ROT13 to reverse this classical rotation cipher.
                  </p>
                </div>
              ) : null}

              {activeId === "epoch" ? (
                <div className={`${styles.terminalOutput} space-y-2 p-4 font-mono text-xs leading-relaxed text-ink-muted`}>
                  <p className="text-electric-300">UNIX_EPOCH = {EPOCH_TRANSMISSION}</p>
                  <p>TARGET_FLAG = KALIPTO&#123;EPOCH_LOCK&#125;</p>
                  <Link href="/tools/timestamp" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-electric-200 hover:text-electric-100">
                    <CodeIcon className="size-4" /> Open timestamp tool
                  </Link>
                </div>
              ) : null}

              {activeId === "xor" ? (
                <div className={`${styles.terminalOutput} space-y-2 p-4 font-mono text-xs leading-relaxed text-ink-muted`}>
                  <p className="text-electric-300 break-all">CIPHER = {XOR_TRANSMISSION}</p>
                  <p>KEY = {XOR_KEY_HEX} (single-byte XOR)</p>
                  <p>Decode each byte: char = byte XOR key, then read ASCII.</p>
                </div>
              ) : null}

              {activeId === "vault" ? (
                <div className={`${styles.terminalOutput} p-4 font-mono text-xs leading-relaxed text-ink-muted`}>
                  <p className="text-electric-300">FINAL_LOCK::ACTIVE</p>
                  <p className="mt-2">FORMAT = KALIPTO&#123;COLOR_IDENTITY&#125;</p>
                  <p>COLOR = dominant interface accent</p>
                  <p>IDENTITY = stealth operator archetype</p>
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowHint((value) => !value)}
                aria-expanded={showHint}
                className="min-h-11 text-sm font-semibold text-ink-faint transition-colors hover:text-electric-200"
              >
                {showHint ? "Hide hint" : "Reveal hint"}
              </button>
              {showHint ? (
                <p role="status" className="rounded-xl border border-hairline bg-white/[0.025] p-3 text-sm text-ink-muted">
                  <span className="font-semibold text-electric-200">Hint:</span> {activeLevel.hint}
                </p>
              ) : null}
            </div>

            <form onSubmit={verifyFlag} className="mt-6 border-t border-hairline pt-6">
              <label htmlFor="challenge-flag" className="text-sm font-semibold text-ink">
                Submit level flag
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="challenge-flag"
                  value={flag}
                  onChange={(event) => setFlag(event.target.value)}
                  maxLength={96}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-hairline-strong bg-black/35 px-4 font-mono text-base uppercase text-ink outline-none transition-colors placeholder:text-ink-faint/55 focus:border-electric-500/60"
                  placeholder="KALIPTO{FLAG_HERE}"
                />
                <Button type="submit" disabled={pending || !flag.trim()}>
                  {pending ? "Verifying…" : "Submit flag"}
                </Button>
              </div>
            </form>

            {feedback ? (
              <div
                role={feedback.tone === "error" ? "alert" : "status"}
                className={cn(
                  "mt-4 rounded-xl border p-4 text-sm",
                  feedback.tone === "success"
                    ? "border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-100"
                    : "border-electric-500/30 bg-electric-500/[0.08] text-electric-100",
                )}
              >
                {feedback.message}
              </div>
            ) : null}

            {solved && activeId !== "vault" ? (
              <div className="mt-5 flex justify-end">
                <Button onClick={moveToNext}>Open next level</Button>
              </div>
            ) : null}
          </section>
        </div>
      </Container>
    </div>
  );
}
