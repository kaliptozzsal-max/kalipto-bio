"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, CheckCircleIcon, SparkIcon } from "@/components/ui/Icon";
import styles from "./Arcade.module.css";

type GameShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  score: number;
  children: ReactNode;
  onExit: () => void;
};

export function GameShell({
  eyebrow,
  title,
  description,
  score,
  children,
  onExit,
}: GameShellProps) {
  return (
    <section aria-labelledby="active-game-title" className={styles.gameBoard}>
      <header className="flex flex-col gap-5 border-b border-hairline p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onExit}
            className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-ink-muted transition-colors hover:text-electric-200 sm:min-h-0"
          >
            <ArrowLeftIcon className="size-4" />
            Arcade dashboard
          </button>
          <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.16em] text-electric-300 uppercase">
            {eyebrow}
          </p>
          <h1
            id="active-game-title"
            data-text={title}
            className="cyber-glitch relative mt-2 inline-block text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-electric-500/25 bg-electric-500/[0.07] px-4 py-3 text-right">
          <p className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-faint uppercase">
            Current score
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-electric-200">
            {score.toLocaleString()}
          </p>
        </div>
      </header>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

export function GameProgress({
  current,
  total,
  label = "Operation progress",
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const value = Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 font-mono text-[0.6875rem] tracking-wide text-ink-faint uppercase">
        <span>{label}</span>
        <span className="tabular-nums">
          {current}/{total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
      >
        <span
          className="block h-full rounded-full bg-gradient-to-r from-electric-700 via-electric-500 to-electric-300 shadow-[0_0_12px_rgba(229,45,67,0.6)] transition-[width] duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function MissionComplete({
  score,
  xp,
  perfect,
  onRestart,
  onExit,
}: {
  score: number;
  xp: number;
  perfect: boolean;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <div className={styles.missionComplete} role="status" aria-live="polite">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-electric-500/35 bg-electric-500/10 text-electric-200 shadow-[0_0_40px_-14px_rgba(229,45,67,0.9)]">
        <CheckCircleIcon className="size-8" />
      </span>
      <p className="mt-5 font-mono text-xs font-semibold tracking-[0.18em] text-electric-300 uppercase">
        Mission complete
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">
        {perfect ? "Perfect operation" : "Objective secured"}
      </h2>
      <div className="mt-5 flex justify-center gap-3">
        <span className="rounded-xl border border-hairline bg-black/25 px-4 py-2 font-mono text-sm text-ink-muted">
          Score <strong className="text-ink">{score}</strong>
        </span>
        <span className="rounded-xl border border-electric-500/25 bg-electric-500/[0.07] px-4 py-2 font-mono text-sm text-electric-200">
          +{xp} XP
        </span>
      </div>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={onRestart} iconLeft={<SparkIcon />}>
          Run again
        </Button>
        <Button onClick={onExit} variant="secondary">
          Dashboard
        </Button>
      </div>
    </div>
  );
}
