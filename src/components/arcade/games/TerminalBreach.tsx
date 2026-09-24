"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TerminalIcon } from "@/components/ui/Icon";
import { terminalStages } from "@/data/arcade";
import { createGameResult } from "@/lib/arcade/game-utils";
import type { GameProps } from "@/lib/arcade/types";
import styles from "../Arcade.module.css";
import {
  GameProgress,
  GameShell,
  MissionComplete,
} from "../GameShell";

type HistoryEntry = {
  command: string;
  lines: readonly string[];
  correct: boolean;
};

export function TerminalBreach({ onComplete, onExit }: GameProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<readonly HistoryEntry[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [complete, setComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const awardedRef = useRef(false);

  const stage = terminalStages[stageIndex];
  const score = complete
    ? finalScore
    : Math.max(200, 500 - mistakes * 35 - hints * 20);

  function reset() {
    setStageIndex(0);
    setInput("");
    setHistory([]);
    setMistakes(0);
    setHints(0);
    setShowHint(false);
    setComplete(false);
    setFinalScore(0);
    awardedRef.current = false;
  }

  function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (complete || !input.trim()) return;

    const command = input.trim().toLowerCase().replace(/\s+/g, " ");
    const accepted = [stage.command, ...(stage.accepted ?? [])].map((item) =>
      item.toLowerCase(),
    );

    if (!accepted.includes(command)) {
      setHistory((current) => [
        ...current,
        {
          command: input.trim(),
          lines: [
            "command rejected by training sandbox",
            "follow the mission briefing or request a hint",
          ],
          correct: false,
        },
      ]);
      setMistakes((value) => value + 1);
      setInput("");
      return;
    }

    setHistory((current) => [
      ...current,
      { command: input.trim(), lines: stage.response, correct: true },
    ]);
    setInput("");
    setShowHint(false);

    if (stageIndex < terminalStages.length - 1) {
      setStageIndex((value) => value + 1);
      return;
    }

    const completedScore = Math.max(200, 500 - mistakes * 35 - hints * 20);
    const perfect = mistakes === 0 && hints === 0;
    const xp = 180 + (perfect ? 70 : 0);
    setFinalScore(completedScore);
    setComplete(true);

    if (!awardedRef.current) {
      awardedRef.current = true;
      onComplete(createGameResult("terminal", completedScore, xp, perfect));
    }
  }

  function revealHint() {
    if (!showHint) setHints((value) => value + 1);
    setShowHint(true);
  }

  return (
    <GameShell
      eyebrow="Simulation 01 // finite sandbox"
      title="Terminal Breach"
      description="Follow a scripted training sequence. Commands are matched as text only—nothing executes on your device or any external system."
      score={score}
      onExit={onExit}
    >
      {complete ? (
        <MissionComplete
          score={finalScore}
          xp={180 + (mistakes === 0 && hints === 0 ? 70 : 0)}
          perfect={mistakes === 0 && hints === 0}
          onRestart={reset}
          onExit={onExit}
        />
      ) : (
        <div className="space-y-5">
          <GameProgress
            current={stageIndex}
            total={terminalStages.length}
            label="Breach sequence"
          />

          <div className={styles.terminalScreen}>
            <div className="flex items-center justify-between border-b border-electric-500/15 px-4 py-3 font-mono text-[0.625rem] tracking-[0.14em] text-ink-faint uppercase">
              <span className="inline-flex items-center gap-2">
                <TerminalIcon className="size-4 text-electric-300" />
                isolated shell
              </span>
              <span>stage {String(stageIndex + 1).padStart(2, "0")}</span>
            </div>

            <div className="max-h-[23rem] space-y-3 overflow-y-auto p-4 font-mono text-[0.8125rem] leading-relaxed sm:p-5">
              <div className="rounded-lg border border-electric-500/15 bg-electric-500/[0.04] p-3 text-electric-200">
                <span className="text-ink-faint">briefing:</span> {stage.briefing}
              </div>

              {history.map((entry, index) => (
                <div key={`${entry.command}-${index}`}>
                  <p className="text-ink">
                    <span className="text-electric-300">$</span> {entry.command}
                  </p>
                  {entry.lines.map((line) => (
                    <p
                      key={line}
                      className={entry.correct ? "text-emerald-300/80" : "text-electric-200/80"}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ))}

              <form onSubmit={submitCommand} className="flex min-w-0 items-center gap-2">
                <label htmlFor="terminal-command" className="shrink-0 text-electric-300">
                  {stage.prompt}
                </label>
                <input
                  id="terminal-command"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-ink caret-electric-300 outline-none placeholder:text-ink-faint/45"
                  placeholder="enter command"
                />
                <span aria-hidden="true" className={styles.terminalCursor}>
                  █
                </span>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-6 text-sm text-ink-muted">
              {showHint ? (
                <p role="status">
                  <span className="font-semibold text-electric-200">Hint:</span>{" "}
                  {stage.hint}
                </p>
              ) : (
                <p>Commands are case-insensitive. Press Enter to submit.</p>
              )}
            </div>
            <Button onClick={revealHint} variant="secondary" size="sm">
              Request hint (-20)
            </Button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
