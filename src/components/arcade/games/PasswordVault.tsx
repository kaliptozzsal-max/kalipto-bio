"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ShieldIcon } from "@/components/ui/Icon";
import { createGameResult } from "@/lib/arcade/game-utils";
import type { GameProps } from "@/lib/arcade/types";
import styles from "../Arcade.module.css";
import { GameShell, MissionComplete } from "../GameShell";

const commonPatterns = ["password", "qwerty", "1234", "admin", "letmein"];

function evaluatePhrase(value: string) {
  const tests = {
    length: value.length >= 14,
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9\s]/.test(value),
    uncommon:
      value.length > 0 &&
      !commonPatterns.some((pattern) => value.toLowerCase().includes(pattern)),
  };
  const categories = [tests.lower, tests.upper, tests.number, tests.symbol].filter(Boolean).length;
  const uniqueRatio = value.length
    ? new Set(value).size / value.length
    : 0;
  const score = Math.min(
    100,
    Math.round(
      Math.min(42, value.length * 2.8) +
        categories * 10 +
        (tests.uncommon ? 10 : 0) +
        Math.min(8, uniqueRatio * 10),
    ),
  );

  let charset = 0;
  if (tests.lower) charset += 26;
  if (tests.upper) charset += 26;
  if (tests.number) charset += 10;
  if (tests.symbol) charset += 32;
  const entropy = value.length && charset
    ? Math.round(value.length * Math.log2(charset))
    : 0;

  return { score, entropy, tests };
}

export function PasswordVault({ onComplete, onExit }: GameProps) {
  const [phrase, setPhrase] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [finalXp, setFinalXp] = useState(0);
  const awardedRef = useRef(false);
  const evaluation = evaluatePhrase(phrase);

  function reset() {
    setPhrase("");
    setVisible(false);
    setMessage(null);
    setComplete(false);
    setFinalXp(0);
    awardedRef.current = false;
  }

  function sealVault() {
    if (evaluation.score < 75) {
      setMessage("Vault rejected the phrase. Reach a score of at least 75.");
      return;
    }

    const perfect = evaluation.score >= 95;
    const xp = 120 + evaluation.score + (perfect ? 50 : 0);
    setMessage(null);
    setFinalXp(xp);
    setComplete(true);
    if (!awardedRef.current) {
      awardedRef.current = true;
      onComplete(createGameResult("vault", evaluation.score, xp, perfect));
    }
  }

  return (
    <GameShell
      eyebrow="Simulation 04 // local strength lab"
      title="Password Vault"
      description="Build a practice phrase and inspect a simple educational heuristic. The phrase never leaves memory and is never stored."
      score={evaluation.score}
      onExit={onExit}
    >
      {complete ? (
        <MissionComplete
          score={evaluation.score}
          xp={finalXp}
          perfect={evaluation.score >= 95}
          onRestart={reset}
          onExit={onExit}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
          <div className="rounded-2xl border border-electric-500/20 bg-black/30 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl border border-electric-500/25 bg-electric-500/[0.08] text-electric-200">
                <ShieldIcon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-ink">Practice phrase</h2>
                <p className="text-xs text-electric-200">Do not enter a password you actually use.</p>
              </div>
            </div>

            <label htmlFor="practice-phrase" className="mt-6 block text-sm font-medium text-ink">
              Candidate phrase
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="practice-phrase"
                type={visible ? "text" : "password"}
                value={phrase}
                onChange={(event) => {
                  setPhrase(event.target.value);
                  setMessage(null);
                }}
                autoComplete="off"
                spellCheck={false}
                className="h-12 min-w-0 flex-1 rounded-xl border border-hairline-strong bg-white/[0.035] px-4 text-base text-ink outline-none transition-colors focus:border-electric-500/55"
                placeholder="Enter a practice phrase"
              />
              <button
                type="button"
                onClick={() => setVisible((value) => !value)}
                aria-label={visible ? "Hide practice phrase" : "Show practice phrase"}
                className="min-w-12 rounded-xl border border-hairline-strong bg-white/[0.04] px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {visible ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-faint uppercase">
                    Vault strength
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-ink">{evaluation.score}</p>
                </div>
                <p className="font-mono text-xs text-ink-faint">≈ {evaluation.entropy} bits*</p>
              </div>
              <div className={cnMeter(evaluation.score, styles.vaultMeter)}>
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-electric-800 via-electric-500 to-electric-200 transition-[width] duration-300"
                  style={{ width: `${evaluation.score}%` }}
                />
              </div>
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-faint">
                *A rough educational estimate, not a security guarantee.
              </p>
            </div>

            {message ? (
              <p role="alert" className="mt-4 rounded-xl border border-electric-500/30 bg-electric-500/[0.08] p-3 text-sm text-electric-100">
                {message}
              </p>
            ) : null}

            <Button onClick={sealVault} disabled={!phrase} className="mt-6 w-full">
              Seal practice vault
            </Button>
          </div>

          <aside className="rounded-2xl border border-hairline bg-white/[0.025] p-5 sm:p-6">
            <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-electric-300 uppercase">
              Strength checks
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["14 or more characters", evaluation.tests.length],
                ["Lowercase letters", evaluation.tests.lower],
                ["Uppercase letters", evaluation.tests.upper],
                ["Numbers", evaluation.tests.number],
                ["Symbols", evaluation.tests.symbol],
                ["No common password pattern", evaluation.tests.uncommon],
              ].map(([label, passed]) => (
                <li key={String(label)} className="flex items-center gap-3 text-ink-muted">
                  <span
                    aria-hidden="true"
                    className={passed ? "grid size-5 place-items-center rounded-full bg-emerald-400/15 text-xs text-emerald-300" : "grid size-5 place-items-center rounded-full bg-white/[0.05] text-xs text-ink-faint"}
                  >
                    {passed ? "✓" : "·"}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </GameShell>
  );
}

function cnMeter(score: number, meterClass: string) {
  const tone = score >= 75
    ? "shadow-[0_0_20px_-8px_rgba(52,211,153,0.7)]"
    : "shadow-[0_0_20px_-8px_rgba(229,45,67,0.7)]";
  return `${meterClass} mt-3 h-2 rounded-full bg-white/[0.06] ${tone}`;
}
