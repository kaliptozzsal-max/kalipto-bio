import type { GameId, GameResult } from "./types";

export function createGameResult(
  gameId: GameId,
  score: number,
  xp: number,
  perfect: boolean,
): GameResult {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    resultId: `${gameId}:${randomPart}`,
    gameId,
    score: Math.max(0, Math.floor(score)),
    xp: Math.max(0, Math.floor(xp)),
    perfect,
    completedAt: Date.now(),
  };
}

/** Event-only Fisher–Yates shuffle. Never call during render. */
export function shuffleItems<T>(items: readonly T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    let unit = Math.random();
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      unit = crypto.getRandomValues(new Uint32Array(1))[0] / 0x1_0000_0000;
    }
    const target = Math.floor(unit * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}
