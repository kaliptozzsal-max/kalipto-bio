"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BrainIcon, ClockIcon } from "@/components/ui/Icon";
import { quizQuestions } from "@/data/arcade";
import { createGameResult } from "@/lib/arcade/game-utils";
import type { GameProps } from "@/lib/arcade/types";
import styles from "../Arcade.module.css";
import {
  GameProgress,
  GameShell,
  MissionComplete,
} from "../GameShell";

const ROUND_SECONDS = 90;

type Phase = "idle" | "playing" | "complete";

export function CyberQuiz({ onComplete, onExit }: GameProps) {
  const timerRef = useRef<number | null>(null);
  const deadlineRef = useRef(0);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const finishedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(ROUND_SECONDS);
  const [finalScore, setFinalScore] = useState(0);
  const [finalXp, setFinalXp] = useState(0);
  const [finalPerfect, setFinalPerfect] = useState(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishQuiz = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopTimer();

    const secondsLeft = Math.max(
      0,
      Math.ceil((deadlineRef.current - performance.now()) / 1000),
    );
    const completedScore = scoreRef.current + secondsLeft * 2;
    const perfect = correctRef.current === quizQuestions.length;
    const xp = 170 + correctRef.current * 12 + (perfect ? 80 : 0);

    setRemaining(secondsLeft);
    setFinalScore(completedScore);
    setFinalXp(xp);
    setFinalPerfect(perfect);
    setPhase("complete");
    onComplete(createGameResult("quiz", completedScore, xp, perfect));
  }, [onComplete, stopTimer]);

  useEffect(() => stopTimer, [stopTimer]);

  function startQuiz() {
    stopTimer();
    finishedRef.current = false;
    scoreRef.current = 0;
    correctRef.current = 0;
    deadlineRef.current = performance.now() + ROUND_SECONDS * 1000;
    setIndex(0);
    setSelected(null);
    setScore(0);
    setRemaining(ROUND_SECONDS);
    setFinalScore(0);
    setFinalXp(0);
    setFinalPerfect(false);
    setPhase("playing");

    timerRef.current = window.setInterval(() => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((deadlineRef.current - performance.now()) / 1000),
      );
      setRemaining(nextRemaining);
      if (nextRemaining === 0) finishQuiz();
    }, 250);
  }

  function chooseAnswer(choice: number) {
    if (selected !== null || phase !== "playing") return;
    setSelected(choice);
    if (choice === quizQuestions[index].answer) {
      correctRef.current += 1;
      scoreRef.current += 100;
      setScore(scoreRef.current);
    }
  }

  function nextQuestion() {
    if (selected === null) return;
    if (index === quizQuestions.length - 1) {
      finishQuiz();
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  const question = quizQuestions[index];

  return (
    <GameShell
      eyebrow="Simulation 05 // timed assessment"
      title="Cyber Quiz"
      description="Answer eight defensive-security questions before the 90-second operation window closes."
      score={phase === "complete" ? finalScore : score}
      onExit={onExit}
    >
      {phase === "complete" ? (
        <MissionComplete
          score={finalScore}
          xp={finalXp}
          perfect={finalPerfect}
          onRestart={startQuiz}
          onExit={onExit}
        />
      ) : phase === "idle" ? (
        <div className="py-12 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-electric-500/30 bg-electric-500/[0.08] text-electric-200">
            <BrainIcon className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-ink">Knowledge check ready</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
            Eight questions, ninety seconds, one answer per question. Explanations appear after every choice.
          </p>
          <Button onClick={startQuiz} className="mt-7">
            Start timed quiz
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <GameProgress current={index + 1} total={quizQuestions.length} label="Questions" />
            <div
              className={remaining <= 15 ? "flex min-h-11 items-center gap-2 rounded-xl border border-electric-500/35 bg-electric-500/10 px-4 font-mono text-sm font-bold tabular-nums text-electric-100" : "flex min-h-11 items-center gap-2 rounded-xl border border-hairline bg-white/[0.03] px-4 font-mono text-sm font-bold tabular-nums text-ink-muted"}
              aria-label={`${remaining} seconds remaining`}
            >
              <ClockIcon className="size-4" />
              {String(Math.floor(remaining / 60)).padStart(2, "0")}:
              {String(remaining % 60).padStart(2, "0")}
            </div>
          </div>

          <div className="rounded-2xl border border-electric-500/20 bg-black/30 p-5 sm:p-7">
            <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-electric-300 uppercase">
              Question {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 text-xl leading-relaxed font-semibold text-ink">
              {question.question}
            </h2>

            <div className="mt-6 grid gap-3">
              {question.choices.map((choice, choiceIndex) => {
                const answered = selected !== null;
                const isCorrect = choiceIndex === question.answer;
                const isSelectedWrong = selected === choiceIndex && !isCorrect;
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={answered}
                    onClick={() => chooseAnswer(choiceIndex)}
                    className={[
                      "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-[transform,background-color,border-color] enabled:hover:-translate-y-0.5 disabled:cursor-default",
                      answered && isCorrect
                        ? styles.choiceCorrect
                        : isSelectedWrong
                          ? styles.choiceWrong
                          : "border-hairline bg-white/[0.025] text-ink-muted enabled:hover:border-hairline-strong enabled:hover:bg-white/[0.05] enabled:hover:text-ink",
                    ].join(" ")}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-current/20 font-mono text-xs">
                      {String.fromCharCode(65 + choiceIndex)}
                    </span>
                    {choice}
                  </button>
                );
              })}
            </div>

            {selected !== null ? (
              <div
                role="status"
                className={selected === question.answer ? "mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] p-4 text-emerald-100" : "mt-5 rounded-xl border border-electric-500/30 bg-electric-500/[0.08] p-4 text-electric-100"}
              >
                <p className="font-semibold">
                  {selected === question.answer ? "Correct." : "Not quite."}
                </p>
                <p className="mt-1 text-sm leading-relaxed opacity-85">
                  {question.explanation}
                </p>
              </div>
            ) : null}
          </div>

          {selected !== null ? (
            <div className="flex justify-end">
              <Button onClick={nextQuestion}>
                {index === quizQuestions.length - 1 ? "Finish quiz" : "Next question"}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </GameShell>
  );
}
