"use client";

import { useSyncExternalStore } from "react";
import { achievementDefinitions } from "@/data/arcade";
import {
  GAME_IDS,
  type ArcadeProfile,
  type GameId,
  type GameResult,
} from "./types";

const STORAGE_KEY = "kalipto:arcade:v1";
const MAX_RECENT_RESULTS = 40;
const achievementIds = new Set(achievementDefinitions.map((item) => item.id));

const emptyScores = (): Record<GameId, number> => ({
  terminal: 0,
  firewall: 0,
  cipher: 0,
  vault: 0,
  quiz: 0,
});

const emptyCompletions = (): Record<GameId, number> => ({
  terminal: 0,
  firewall: 0,
  cipher: 0,
  vault: 0,
  quiz: 0,
});

export const DEFAULT_ARCADE_PROFILE: ArcadeProfile = {
  version: 1,
  xp: 0,
  streak: 0,
  lastPlayed: null,
  highScores: emptyScores(),
  completions: emptyCompletions(),
  achievements: [],
  recentResultIds: [],
};

let snapshot: ArcadeProfile = DEFAULT_ARCADE_PROFILE;
let initialized = false;
let listening = false;
const listeners = new Set<() => void>();

function finiteNonNegative(value: unknown, maximum = 1_000_000) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(maximum, Math.floor(value)))
    : 0;
}

function sanitizeGameRecord(
  value: unknown,
  fallback: () => Record<GameId, number>,
) {
  const result = fallback();
  if (!value || typeof value !== "object") return result;

  for (const id of GAME_IDS) {
    result[id] = finiteNonNegative(
      (value as Partial<Record<GameId, unknown>>)[id],
    );
  }
  return result;
}

function sanitizeProfile(value: unknown): ArcadeProfile {
  if (!value || typeof value !== "object") return DEFAULT_ARCADE_PROFILE;
  const candidate = value as Partial<ArcadeProfile>;

  return {
    version: 1,
    xp: finiteNonNegative(candidate.xp),
    streak: finiteNonNegative(candidate.streak, 3650),
    lastPlayed:
      typeof candidate.lastPlayed === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(candidate.lastPlayed)
        ? candidate.lastPlayed
        : null,
    highScores: sanitizeGameRecord(candidate.highScores, emptyScores),
    completions: sanitizeGameRecord(candidate.completions, emptyCompletions),
    achievements: Array.isArray(candidate.achievements)
      ? [...new Set(candidate.achievements)]
          .filter(
            (id): id is string =>
              typeof id === "string" && achievementIds.has(id),
          )
          .slice(0, achievementDefinitions.length)
      : [],
    recentResultIds: Array.isArray(candidate.recentResultIds)
      ? candidate.recentResultIds
          .filter((id): id is string => typeof id === "string")
          .slice(-MAX_RECENT_RESULTS)
      : [],
  };
}

function readStoredProfile() {
  if (typeof window === "undefined") return DEFAULT_ARCADE_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProfile(JSON.parse(raw)) : DEFAULT_ARCADE_PROFILE;
  } catch {
    return DEFAULT_ARCADE_PROFILE;
  }
}

function ensureInitialized() {
  if (!initialized && typeof window !== "undefined") {
    snapshot = readStoredProfile();
    initialized = true;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: ArcadeProfile) {
  snapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be disabled or full; in-memory progress still works.
    }
  }
  emit();
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  snapshot = event.newValue
    ? sanitizeProfile(
        (() => {
          try {
            return JSON.parse(event.newValue);
          } catch {
            return null;
          }
        })(),
      )
    : DEFAULT_ARCADE_PROFILE;
  initialized = true;
  emit();
}

function subscribe(listener: () => void) {
  ensureInitialized();
  listeners.add(listener);

  if (!listening && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
    listening = true;
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && listening && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
      listening = false;
    }
  };
}

function getSnapshot() {
  ensureInitialized();
  return snapshot;
}

function getServerSnapshot() {
  return DEFAULT_ARCADE_PROFILE;
}

function localDay(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayDistance(previous: string, current: string) {
  const previousDate = new Date(`${previous}T00:00:00`);
  const currentDate = new Date(`${current}T00:00:00`);
  return Math.round((currentDate.getTime() - previousDate.getTime()) / 86_400_000);
}

function unlockAchievements(profile: ArcadeProfile, result: GameResult) {
  const unlock = new Set(profile.achievements);
  unlock.add("first-operation");

  if (result.perfect) {
    const perfectIds: Partial<Record<GameId, string>> = {
      terminal: "terminal-ghost",
      firewall: "packet-guardian",
      cipher: "cipher-phantom",
      vault: "vault-architect",
      quiz: "zero-day-scholar",
    };
    const achievement = perfectIds[result.gameId];
    if (achievement) unlock.add(achievement);
  }

  if (GAME_IDS.every((id) => profile.completions[id] > 0)) {
    unlock.add("full-spectrum");
  }
  if (profile.xp >= 1000) unlock.add("elite-operator");
  if (profile.streak >= 3) unlock.add("persistent-node");

  return [...unlock];
}

export function calculateArcadeLevel(xp: number) {
  const safeXp = finiteNonNegative(xp);
  const level = Math.floor(Math.sqrt(safeXp / 200)) + 1;
  const levelFloor = (level - 1) ** 2 * 200;
  const nextLevelAt = level ** 2 * 200;
  return {
    level,
    levelFloor,
    nextLevelAt,
    progress:
      nextLevelAt === levelFloor
        ? 1
        : (safeXp - levelFloor) / (nextLevelAt - levelFloor),
  };
}

export function recordArcadeResult(result: GameResult) {
  ensureInitialized();
  if (snapshot.recentResultIds.includes(result.resultId)) return [];

  const playedDay = localDay(result.completedAt);
  let streak = 1;
  if (snapshot.lastPlayed === playedDay) {
    streak = Math.max(1, snapshot.streak);
  } else if (
    snapshot.lastPlayed &&
    dayDistance(snapshot.lastPlayed, playedDay) === 1
  ) {
    streak = snapshot.streak + 1;
  }

  const next: ArcadeProfile = {
    ...snapshot,
    xp: snapshot.xp + finiteNonNegative(result.xp, 10_000),
    streak,
    lastPlayed: playedDay,
    highScores: {
      ...snapshot.highScores,
      [result.gameId]: Math.max(
        snapshot.highScores[result.gameId],
        finiteNonNegative(result.score),
      ),
    },
    completions: {
      ...snapshot.completions,
      [result.gameId]: snapshot.completions[result.gameId] + 1,
    },
    recentResultIds: [
      ...snapshot.recentResultIds,
      result.resultId,
    ].slice(-MAX_RECENT_RESULTS),
  };

  const previousAchievements = new Set(snapshot.achievements);
  next.achievements = unlockAchievements(next, result);
  const newlyUnlocked = next.achievements.filter(
    (id) => !previousAchievements.has(id),
  );
  persist(next);
  return newlyUnlocked;
}

export function resetArcadeProfile() {
  initialized = true;
  persist({
    ...DEFAULT_ARCADE_PROFILE,
    highScores: emptyScores(),
    completions: emptyCompletions(),
    achievements: [],
    recentResultIds: [],
  });
}

export function useArcadeProfile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
