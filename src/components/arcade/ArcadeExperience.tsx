"use client";

import { useCallback, useState } from "react";
import { Container } from "@/components/ui/Container";
import {
  BrainIcon,
  CheckCircleIcon,
  CodeIcon,
  ShieldIcon,
  SparkIcon,
  StarIcon,
  TerminalIcon,
} from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { achievementDefinitions, gameDefinitions } from "@/data/arcade";
import {
  calculateArcadeLevel,
  recordArcadeResult,
  resetArcadeProfile,
  useArcadeProfile,
} from "@/lib/arcade/profile-store";
import type {
  GameDefinition,
  GameId,
  GameResult,
} from "@/lib/arcade/types";
import styles from "./Arcade.module.css";
import { HackerAvatar } from "./HackerAvatar";
import { CipherBreaker } from "./games/CipherBreaker";
import { CyberQuiz } from "./games/CyberQuiz";
import { FirewallDefender } from "./games/FirewallDefender";
import { PasswordVault } from "./games/PasswordVault";
import { TerminalBreach } from "./games/TerminalBreach";

type AwardNotice = {
  xp: number;
  achievements: readonly string[];
};

const ranks = [
  "Recruit",
  "Signal Runner",
  "Node Operator",
  "Cipher Agent",
  "Ghost Analyst",
  "Red Team Elite",
] as const;

function rankForLevel(level: number) {
  return ranks[Math.min(ranks.length - 1, Math.floor((level - 1) / 2))];
}

function GameIcon({
  icon,
  className,
}: {
  icon: GameDefinition["icon"];
  className?: string;
}) {
  switch (icon) {
    case "terminal":
      return <TerminalIcon className={className} />;
    case "shield":
      return <ShieldIcon className={className} />;
    case "code":
      return <CodeIcon className={className} />;
    case "star":
      return <StarIcon className={className} />;
    case "brain":
      return <BrainIcon className={className} />;
  }
}

function ActiveGame({
  id,
  onComplete,
  onExit,
}: {
  id: GameId;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}) {
  const props = { onComplete, onExit };
  switch (id) {
    case "terminal":
      return <TerminalBreach {...props} />;
    case "firewall":
      return <FirewallDefender {...props} />;
    case "cipher":
      return <CipherBreaker {...props} />;
    case "vault":
      return <PasswordVault {...props} />;
    case "quiz":
      return <CyberQuiz {...props} />;
  }
}

export function ArcadeExperience() {
  const profile = useArcadeProfile();
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [award, setAward] = useState<AwardNotice | null>(null);
  const level = calculateArcadeLevel(profile.xp);
  const unlocked = new Set(profile.achievements);
  const totalCompletions = Object.values(profile.completions).reduce(
    (sum, count) => sum + count,
    0,
  );

  const handleComplete = useCallback((result: GameResult) => {
    const achievements = recordArcadeResult(result);
    setAward({ xp: result.xp, achievements });
  }, []);

  const exitGame = useCallback(() => {
    setActiveGame(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function launchGame(id: GameId) {
    setAward(null);
    setActiveGame(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetProgress() {
    if (
      window.confirm(
        "Reset all local Hacker Arcade XP, scores, streaks, and achievements?",
      )
    ) {
      resetArcadeProfile();
      setAward(null);
    }
  }

  return (
    <div className={`${styles.cyberUi} relative pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36`}>
      <Container size="wide">
        {activeGame ? (
          <ActiveGame
            key={activeGame}
            id={activeGame}
            onComplete={handleComplete}
            onExit={exitGame}
          />
        ) : (
          <>
            <SectionHeading
              eyebrow="Hacker Arcade"
              align="left"
              title={
                <>
                  Train inside the <span className="text-gradient">simulation</span>
                </>
              }
              subtitle="Five safe cybersecurity games. No real targets, no shell execution, and no game data leaves your browser."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <section className={`${styles.operatorIdentity} cyber-card relative overflow-hidden rounded-2xl border border-electric-500/30 bg-electric-500/[0.06] p-5 sm:col-span-2 sm:p-6`}>
                <div className="grid items-center gap-7 sm:grid-cols-[auto_minmax(0,1fr)]">
                  <div className="flex justify-center sm:justify-start">
                    <HackerAvatar
                      level={level.level}
                      rank={rankForLevel(level.level)}
                      progress={level.progress}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-mono text-[0.625rem] font-semibold tracking-[0.18em] text-electric-300 uppercase">
                      Operator identity // verified
                    </p>
                    <h2
                      data-text="KALIPTO"
                      className={`${styles.operatorName} cyber-glitch relative mt-2 inline-block text-3xl text-gradient sm:text-4xl`}
                    >
                      KALIPTO
                    </h2>
                    <p className={`${styles.cyberFont} mt-1 text-sm font-semibold tracking-[0.05em] text-ink`}>
                      Level {level.level} · {rankForLevel(level.level)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[0.625rem] tracking-[0.08em] text-ink-faint uppercase">
                      <span className="rounded-md border border-hairline bg-black/25 px-2 py-1">
                        ID KLP-7F2A
                      </span>
                      <span className="rounded-md border border-hairline bg-black/25 px-2 py-1">
                        Clearance {Math.min(9, level.level)}
                      </span>
                      <span className="rounded-md border border-emerald-400/20 bg-emerald-400/[0.05] px-2 py-1 text-emerald-300">
                        Link secure
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between gap-4 font-mono text-[0.625rem] text-ink-faint">
                        <span>LVL_{String(level.level).padStart(2, "0")}</span>
                        <span>
                          {profile.xp - level.levelFloor} / {level.nextLevelAt - level.levelFloor} XP
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Level ${level.level} progress`}
                        aria-valuemin={level.levelFloor}
                        aria-valuemax={level.nextLevelAt}
                        aria-valuenow={profile.xp}
                        className={`${styles.vaultMeter} h-2 overflow-hidden rounded-full bg-black/35`}
                      >
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-electric-800 via-electric-500 to-electric-200 shadow-[0_0_16px_rgba(229,45,67,0.7)] transition-[width] duration-500"
                          style={{ width: `${Math.max(0, Math.min(100, level.progress * 100))}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-hairline bg-black/20 p-2.5">
                        <p className={`${styles.cyberFont} text-lg font-bold text-ink`}>
                          {totalCompletions}
                        </p>
                        <p className="text-[0.625rem] text-ink-faint">Operations</p>
                      </div>
                      <div className="rounded-lg border border-hairline bg-black/20 p-2.5">
                        <p className={`${styles.cyberFont} text-lg font-bold text-ink`}>
                          {profile.streak}
                        </p>
                        <p className="text-[0.625rem] text-ink-faint">Day streak</p>
                      </div>
                      <div className="rounded-lg border border-hairline bg-black/20 p-2.5">
                        <p className={`${styles.cyberFont} text-lg font-bold text-ink`}>
                          {profile.xp.toLocaleString()}
                        </p>
                        <p className="text-[0.625rem] text-ink-faint">Total XP</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="cyber-card relative overflow-hidden rounded-2xl border border-hairline bg-void-900/75 p-5 sm:p-6">
                <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                  Achievement vault
                </p>
                <p className="mt-3 text-3xl font-semibold text-ink">
                  {profile.achievements.length}
                  <span className="text-base font-normal text-ink-faint">
                    /{achievementDefinitions.length}
                  </span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Complete operations and perfect runs to unlock encrypted badges.
                </p>
              </section>

              <section className="cyber-card relative overflow-hidden rounded-2xl border border-hairline bg-void-900/75 p-5 sm:p-6">
                <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                  Storage channel
                </p>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  Local only
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Progress stays in this browser. No account or network request is used.
                </p>
              </section>
            </div>

            <section className="cyber-card relative mt-8 overflow-hidden rounded-2xl border border-electric-500/35 bg-[radial-gradient(circle_at_85%_20%,rgba(229,45,67,0.16),transparent_38%),rgba(8,5,6,0.88)] p-6 shadow-[0_30px_80px_-42px_rgba(201,31,54,0.72)] sm:p-8">
              <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-xl border border-electric-500/35 bg-electric-500/10 font-mono text-lg font-bold text-electric-100 shadow-[0_0_28px_-10px_rgba(229,45,67,0.9)]">
                      CTF
                    </span>
                    <div>
                      <p className="font-mono text-[0.625rem] font-semibold tracking-[0.16em] text-electric-300 uppercase">
                        Live route challenge
                      </p>
                      <p className="mt-1 font-mono text-xs text-ink-faint">
                        /challenge · five flags · phone ready
                      </p>
                    </div>
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-ink sm:text-3xl">
                    Hack the isolated Kalipto sandbox
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                    Follow source, robots, response-header, cipher, and final-vault clues. The challenge contains only fictional flags and grants no real system access.
                  </p>
                </div>
                <a
                  href="/challenge"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-electric-500/55 bg-gradient-to-br from-electric-600 to-electric-700 px-6 font-semibold text-white shadow-[0_16px_38px_-18px_rgba(201,31,54,0.95)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-18px_rgba(201,31,54,1)] active:translate-y-0"
                >
                  Launch challenge <span aria-hidden="true">→</span>
                </a>
              </div>
            </section>

            <section aria-labelledby="operations-heading" className="mt-14">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.16em] text-electric-300 uppercase">
                    Available simulations
                  </p>
                  <h2 id="operations-heading" className="cyber-heading mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                    Select an operation
                  </h2>
                </div>
                <p className="text-sm text-ink-faint">Higher scores replace local records.</p>
              </div>

              <ul className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {gameDefinitions.map((game, index) => (
                  <li key={game.id}>
                    <button
                      type="button"
                      onClick={() => launchGame(game.id)}
                      className="cyber-card group relative flex h-full min-h-64 w-full flex-col overflow-hidden rounded-2xl border border-hairline bg-void-900/75 p-6 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-electric-500/30 hover:shadow-[0_26px_65px_-38px_rgba(201,31,54,0.65)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid size-12 place-items-center rounded-xl border border-electric-500/25 bg-electric-500/[0.07] text-electric-200 transition-transform duration-300 group-hover:scale-105">
                          <GameIcon icon={game.icon} className="size-6" />
                        </span>
                        <span className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-faint">
                          OP_{String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <p className="mt-5 font-mono text-[0.625rem] font-semibold tracking-[0.12em] text-electric-300 uppercase">
                        {game.difficulty}
                      </p>
                      <h3 className="mt-1.5 text-xl font-semibold text-ink">{game.name}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                        {game.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-4 border-t border-hairline pt-4">
                        <span className="text-sm font-semibold text-electric-200 transition-colors group-hover:text-electric-100">
                          Launch simulation →
                        </span>
                        <span className="font-mono text-xs text-ink-faint">
                          BEST {profile.highScores[game.id].toLocaleString()}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="achievements-heading" className="mt-16">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.16em] text-electric-300 uppercase">
                    Encrypted rewards
                  </p>
                  <h2 id="achievements-heading" className="cyber-heading mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                    Achievement vault
                  </h2>
                </div>
                {totalCompletions > 0 ? (
                  <button
                    type="button"
                    onClick={resetProgress}
                    className="min-h-11 rounded-lg px-2 text-xs font-medium text-ink-faint transition-colors hover:text-electric-200"
                  >
                    Reset local progress
                  </button>
                ) : null}
              </div>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {achievementDefinitions.map((achievement) => {
                  const isUnlocked = unlocked.has(achievement.id);
                  return (
                    <li
                      key={achievement.id}
                      className={
                        isUnlocked
                          ? "flex items-start gap-3 rounded-xl border border-electric-500/25 bg-electric-500/[0.055] p-4"
                          : "flex items-start gap-3 rounded-xl border border-hairline bg-black/20 p-4 opacity-60"
                      }
                    >
                      <span
                        className={
                          isUnlocked
                            ? "grid size-9 shrink-0 place-items-center rounded-lg bg-electric-500/12 text-electric-200"
                            : "grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-ink-faint"
                        }
                      >
                        {isUnlocked ? (
                          <CheckCircleIcon className="size-4" />
                        ) : (
                          <span aria-hidden="true" className="font-mono text-xs">?</span>
                        )}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">{achievement.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                          {achievement.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        <div className="sr-only" role="status" aria-live="polite">
          {award
            ? `Operation complete. ${award.xp} XP awarded. ${award.achievements.length} achievements unlocked.`
            : ""}
        </div>

        {award ? (
          <div className="fixed right-4 bottom-4 z-40 w-[min(calc(100%_-_2rem),24rem)] rounded-2xl border border-electric-500/35 bg-void-900/95 p-4 shadow-[0_24px_70px_-28px_rgba(201,31,54,0.8)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-electric-500/12 text-electric-200">
                <SparkIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">+{award.xp} XP secured</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {award.achievements.length > 0
                    ? `${award.achievements.length} new achievement${award.achievements.length === 1 ? "" : "s"} unlocked.`
                    : "Local profile and high score updated."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAward(null)}
                aria-label="Dismiss achievement notification"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-white/[0.05] hover:text-ink"
              >
                ×
              </button>
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
