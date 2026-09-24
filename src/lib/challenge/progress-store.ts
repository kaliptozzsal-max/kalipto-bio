"use client";

import { useSyncExternalStore } from "react";
import {
  CHALLENGE_LEVEL_IDS,
  type ChallengeLevelId,
} from "@/data/challenge";

const STORAGE_KEY = "kalipto:challenge:v1";

type ChallengeProgress = {
  version: 1;
  solved: ChallengeLevelId[];
  completed: boolean;
};

const DEFAULT_PROGRESS: ChallengeProgress = {
  version: 1,
  solved: [],
  completed: false,
};

const validIds = new Set<string>(CHALLENGE_LEVEL_IDS);
let snapshot = DEFAULT_PROGRESS;
let initialized = false;
let listening = false;
const listeners = new Set<() => void>();

function sanitize(value: unknown): ChallengeProgress {
  if (!value || typeof value !== "object") return DEFAULT_PROGRESS;
  const raw = value as Partial<ChallengeProgress>;
  const solved = Array.isArray(raw.solved)
    ? ([...new Set(raw.solved)]
        .filter(
          (id): id is ChallengeLevelId =>
            typeof id === "string" && validIds.has(id),
        )
        .slice(0, CHALLENGE_LEVEL_IDS.length) as ChallengeLevelId[])
    : [];

  return {
    version: 1,
    solved,
    completed: CHALLENGE_LEVEL_IDS.every((id) => solved.includes(id)),
  };
}

function readProgress() {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? sanitize(JSON.parse(value)) : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function initialize() {
  if (!initialized && typeof window !== "undefined") {
    snapshot = readProgress();
    initialized = true;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: ChallengeProgress) {
  snapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode or quota errors keep progress in memory for this tab.
    }
  }
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  if (!event.newValue) {
    snapshot = DEFAULT_PROGRESS;
  } else {
    try {
      snapshot = sanitize(JSON.parse(event.newValue));
    } catch {
      snapshot = DEFAULT_PROGRESS;
    }
  }
  initialized = true;
  emit();
}

function subscribe(listener: () => void) {
  initialize();
  listeners.add(listener);
  if (!listening && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    listening = true;
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && listening && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
      listening = false;
    }
  };
}

function getSnapshot() {
  initialize();
  return snapshot;
}

function getServerSnapshot() {
  return DEFAULT_PROGRESS;
}

export function markChallengeSolved(id: ChallengeLevelId) {
  initialize();
  if (snapshot.solved.includes(id)) return;
  const solved = [...snapshot.solved, id];
  persist({
    version: 1,
    solved,
    completed: CHALLENGE_LEVEL_IDS.every((levelId) => solved.includes(levelId)),
  });
}

export function resetChallengeProgress() {
  initialized = true;
  persist({ version: 1, solved: [], completed: false });
}

export function useChallengeProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
