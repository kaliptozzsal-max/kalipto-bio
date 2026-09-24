"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CodeIcon } from "@/components/ui/Icon";
import { cipherChallenges } from "@/data/arcade";
import { createGameResult, normalizeAnswer } from "@/lib/arcade/game-utils";
import type { GameProps } from "@/lib/arcade/types";
import {
  GameProgress,
  GameShell,
  MissionComplete,
} from "../GameShell";

export function CipherBreaker({ onComplete, onExit }: GameProps) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [usedHints, setUsedHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [complete, setComplete] = useState(false);
  const [finalXp, setFinalXp] = useState(0);
  const awardedRef = useRef(false);

  const challenge = cipherChallenges[index];

  function reset() {
    setIndex(0);
    setInput("");
    setScore(0);
    setAttempts(0);
    setTotalMistakes(0);
    setUsedHints(0);
    setShowHint(false);
    setSolved(false);
    setComplete(false);
    setFinalXp(0);
    awardedRef.current = false;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (solved || !input.trim()) return;

    if (normalizeAnswer(input) !== normalizeAnswer(challenge.answer)) {
      setAttempts((value) => value + 1);
      setTotalMistakes((value) => value + 1);
      return;
    }

    const gained = Math.max(80, 200 - attempts * 30 - (showHint ? 25 : 0));
    setScore((value) => value + gained);
    setSolved(true);
  }

  function revealHint() {
    if (!showHint) setUsedHints((value) => value + 1);
    setShowHint(true);
  }

  function next() {
    if (!solved) return;
    if (index < cipherChallenges.length - 1) {
      setIndex((value) => value + 1);
      setInput("");
      setAttempts(0);
      setShowHint(false);
      setSolved(false);
      return;
    }

    const perfect = totalMistakes === 0 && usedHints === 0;
    const xp = 170 + (perfect ? 80 : 0);
    setFinalXp(xp);
    setComplete(true);
    if (!awardedRef.current) {
      awardedRef.current = true;
      onComplete(createGameResult("cipher", score, xp, perfect));
    }
  }

  return (
    <GameShell
      eyebrow="Simulation 03 // classical signals"
      title="Cipher Breaker"
      description="Decode fixed educational messages. These classical encodings are puzzles, not secure modern cryptography."
      score={score}
      onExit={onExit}
    >
      {complete ? (
        <MissionComplete
          score={score}
          xp={finalXp}
          perfect={totalMistakes === 0 && usedHints === 0}
          onRestart={reset}
          onExit={onExit}
        />
      ) : (
        <div className="space-y-6">
          <GameProgress current={index + (solved ? 1 : 0)} total={cipherChallenges.length} label="Signals decoded" />

          <div className="rounded-2xl border border-electric-500/20 bg-black/35 p-5 shadow-[inset_0_0_50px_rgba(201,31,54,0.04)] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-electric-300 uppercase">
                <CodeIcon className="size-4" />
                {challenge.type} intercept
              </span>
              <span className="font-mono text-[0.6875rem] text-ink-faint">
                {String(index + 1).padStart(2, "0")}/{cipherChallenges.length}
              </span>
            </div>

            <p className="mt-6 overflow-x-auto rounded-xl border border-hairline bg-black/45 p-5 text-center font-mono text-lg leading-relaxed tracking-[0.12em] text-electric-100 shadow-[0_0_30px_-20px_rgba(229,45,67,0.7)] sm:text-xl">
              {challenge.payload}
            </p>

            <form onSubmit={submit} className="mt-5">
              <label htmlFor="cipher-answer" className="text-sm font-medium text-ink">
                Decoded message
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="cipher-answer"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={solved}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-hairline-strong bg-white/[0.035] px-4 font-mono text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-electric-500/55"
                  placeholder="ENTER PLAINTEXT"
                />
                <Button type="submit" disabled={solved || !input.trim()}>
                  Decode signal
                </Button>
              </div>
            </form>

            {attempts > 0 && !solved ? (
              <p role="alert" className="mt-3 text-sm text-electric-200">
                Signal mismatch. Inspect the encoding and try again.
              </p>
            ) : null}

            {showHint && !solved ? (
              <p role="status" className="mt-3 rounded-xl border border-hairline bg-white/[0.025] p-3 text-sm text-ink-muted">
                <span className="font-semibold text-electric-200">Hint:</span>{" "}
                {challenge.hint}
              </p>
            ) : null}

            {solved ? (
              <div role="status" className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] p-4 text-emerald-100">
                <p className="font-semibold">Signal decoded: {challenge.answer}</p>
                <p className="mt-1 text-sm leading-relaxed opacity-85">
                  {challenge.explanation}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-3">
            {!solved ? (
              <Button onClick={revealHint} variant="secondary" size="sm">
                Hint (-25)
              </Button>
            ) : (
              <Button onClick={next}>
                {index === cipherChallenges.length - 1 ? "Complete operation" : "Next signal"}
              </Button>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}
