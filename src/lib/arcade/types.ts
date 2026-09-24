export const GAME_IDS = [
  "terminal",
  "firewall",
  "cipher",
  "vault",
  "quiz",
] as const;

export type GameId = (typeof GAME_IDS)[number];

export type GameResult = {
  resultId: string;
  gameId: GameId;
  score: number;
  xp: number;
  perfect: boolean;
  completedAt: number;
};

export type ArcadeProfile = {
  version: 1;
  xp: number;
  streak: number;
  lastPlayed: string | null;
  highScores: Record<GameId, number>;
  completions: Record<GameId, number>;
  achievements: string[];
  recentResultIds: string[];
};

export type GameDefinition = {
  id: GameId;
  name: string;
  shortName: string;
  description: string;
  objective: string;
  icon: "terminal" | "shield" | "code" | "star" | "brain";
  difficulty: "Recruit" | "Operator" | "Elite";
};

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  hidden?: boolean;
};

export type GameProps = {
  onComplete: (result: GameResult) => void;
  onExit: () => void;
};

export type TerminalStage = {
  id: string;
  briefing: string;
  prompt: string;
  command: string;
  accepted?: readonly string[];
  response: readonly string[];
  hint: string;
};

export type FirewallPacket = {
  id: string;
  source: string;
  protocol: string;
  port: string;
  signature: string;
  verdict: "allow" | "block";
  reason: string;
};

export type CipherChallenge = {
  id: string;
  type: "Caesar" | "Base64" | "Hex" | "Binary";
  payload: string;
  answer: string;
  hint: string;
  explanation: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  choices: readonly string[];
  answer: number;
  explanation: string;
};
