"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ShieldIcon } from "@/components/ui/Icon";
import { firewallPackets } from "@/data/arcade";
import { createGameResult, shuffleItems } from "@/lib/arcade/game-utils";
import type { FirewallPacket, GameProps } from "@/lib/arcade/types";
import styles from "../Arcade.module.css";
import {
  GameProgress,
  GameShell,
  MissionComplete,
} from "../GameShell";

type Feedback = {
  correct: boolean;
  reason: string;
  verdict: FirewallPacket["verdict"];
};

export function FirewallDefender({ onComplete, onExit }: GameProps) {
  const [packets, setPackets] = useState<readonly FirewallPacket[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [complete, setComplete] = useState(false);
  const [finalXp, setFinalXp] = useState(0);
  const awardedRef = useRef(false);

  const packet = packets[index];

  function startRun() {
    setPackets(shuffleItems(firewallPackets));
    setIndex(0);
    setScore(0);
    setCorrectCount(0);
    setCombo(0);
    setFeedback(null);
    setComplete(false);
    setFinalXp(0);
    awardedRef.current = false;
  }

  function classify(verdict: FirewallPacket["verdict"]) {
    if (!packet || feedback) return;
    const correct = verdict === packet.verdict;
    const nextCombo = correct ? combo + 1 : 0;
    const gained = correct ? 100 + combo * 15 : 0;

    setScore((value) => value + gained);
    setCombo(nextCombo);
    if (correct) setCorrectCount((value) => value + 1);
    setFeedback({ correct, reason: packet.reason, verdict: packet.verdict });
  }

  function nextPacket() {
    if (!feedback) return;
    if (index < packets.length - 1) {
      setIndex((value) => value + 1);
      setFeedback(null);
      return;
    }

    const perfect = correctCount === packets.length;
    const xp = 160 + correctCount * 12 + (perfect ? 80 : 0);
    setFinalXp(xp);
    setComplete(true);
    if (!awardedRef.current) {
      awardedRef.current = true;
      onComplete(createGameResult("firewall", score, xp, perfect));
    }
  }

  return (
    <GameShell
      eyebrow="Simulation 02 // packet classifier"
      title="Firewall Defender"
      description="Classify developer-authored fictional packet summaries. No network traffic is captured, inspected, or transmitted."
      score={score}
      onExit={onExit}
    >
      {complete ? (
        <MissionComplete
          score={score}
          xp={finalXp}
          perfect={correctCount === packets.length}
          onRestart={startRun}
          onExit={onExit}
        />
      ) : packets.length === 0 ? (
        <div className="py-12 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-electric-500/30 bg-electric-500/[0.08] text-electric-200">
            <ShieldIcon className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-ink">Defend node 01</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
            Review ten synthetic packets. Build a combo by making consecutive correct decisions.
          </p>
          <Button onClick={startRun} className="mt-7">
            Start packet stream
          </Button>
        </div>
      ) : packet ? (
        <div className="space-y-6">
          <GameProgress current={index + 1} total={packets.length} label="Packet stream" />

          <article key={packet.id} className={styles.packetCard}>
            <div className="overflow-hidden rounded-2xl border border-electric-500/20 bg-black/35">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3 font-mono text-[0.6875rem] text-ink-faint sm:px-5">
                <span>PACKET::{String(index + 1).padStart(3, "0")}</span>
                <span className="text-electric-300">COMBO ×{combo}</span>
              </div>
              <dl className="grid gap-px bg-hairline sm:grid-cols-3">
                {[
                  ["Source", packet.source],
                  ["Protocol", packet.protocol],
                  ["Port", packet.port],
                ].map(([label, value]) => (
                  <div key={label} className="bg-void-900/95 p-4">
                    <dt className="font-mono text-[0.625rem] tracking-[0.12em] text-ink-faint uppercase">
                      {label}
                    </dt>
                    <dd className="mt-1.5 font-mono text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="p-5 sm:p-7">
                <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-electric-300 uppercase">
                  Detected signature
                </p>
                <p className="mt-3 text-lg leading-relaxed font-medium text-ink">
                  {packet.signature}
                </p>
              </div>
            </div>
          </article>

          {feedback ? (
            <div
              role="status"
              className={cnFeedback(feedback.correct)}
            >
              <p className="font-semibold">
                {feedback.correct ? "Correct decision." : "Incorrect decision."}{" "}
                Expected: {feedback.verdict.toUpperCase()}.
              </p>
              <p className="mt-1 text-sm leading-relaxed opacity-85">{feedback.reason}</p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {feedback ? (
              <Button onClick={nextPacket} className="sm:col-span-2">
                {index === packets.length - 1 ? "Complete operation" : "Next packet"}
              </Button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => classify("allow")}
                  className="min-h-14 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] px-5 font-semibold text-emerald-200 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-emerald-400/12 active:translate-y-0"
                >
                  Allow packet
                </button>
                <button
                  type="button"
                  onClick={() => classify("block")}
                  className="min-h-14 rounded-xl border border-electric-500/35 bg-electric-500/[0.08] px-5 font-semibold text-electric-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-electric-500/14 active:translate-y-0"
                >
                  Block packet
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </GameShell>
  );
}

function cnFeedback(correct: boolean) {
  return correct
    ? "rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] p-4 text-emerald-100"
    : "rounded-xl border border-electric-500/30 bg-electric-500/[0.08] p-4 text-electric-100";
}
