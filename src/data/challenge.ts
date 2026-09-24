export const CHALLENGE_LEVEL_IDS = [
  "source",
  "robots",
  "cipher",
  "header",
  "cookie",
  "meta",
  "rot13",
  "epoch",
  "xor",
  "vault",
] as const;

export type ChallengeLevelId = (typeof CHALLENGE_LEVEL_IDS)[number];

export type ChallengeTier = "Easy" | "Medium" | "Hard" | "Insane";

export type ChallengeLevel = {
  id: ChallengeLevelId;
  number: string;
  name: string;
  vector: string;
  tier: ChallengeTier;
  points: number;
  briefing: string;
  objective: string;
  hint: string;
};

/** Fixed, precomputed puzzle payloads. No secrets are exposed by these. */
export const CIPHER_TRANSMISSION = "S0FMSVBUT3tDSVBIRVJfTk9ERX0=";
export const ROT13_TRANSMISSION = "XNYVCGB{EBGNGVBA_ERYNL}";
export const XOR_TRANSMISSION =
  "61 6b 66 63 7a 7e 65 51 72 65 78 75 7a 62 6b 64 7e 65 67 57";
export const XOR_KEY_HEX = "0x2A";
export const EPOCH_TRANSMISSION = "1700000000";

export const tierOrder: readonly ChallengeTier[] = [
  "Easy",
  "Medium",
  "Hard",
  "Insane",
];

export const challengeLevels: readonly ChallengeLevel[] = [
  {
    id: "source",
    number: "01",
    name: "Source Ghost",
    vector: "DOM reconnaissance",
    tier: "Easy",
    points: 100,
    briefing:
      "A training flag is hidden in a data attribute inside this page's rendered HTML.",
    objective:
      "Inspect the page source or element tree and locate the KALIPTO{...} marker. Phone operators can use the built-in DOM scanner.",
    hint: "Search for an element carrying the data-ctf-flag attribute.",
  },
  {
    id: "robots",
    number: "02",
    name: "Robots Whisper",
    vector: "Public text discovery",
    tier: "Easy",
    points: 100,
    briefing:
      "A fictional crawler policy contains a training flag and points toward the header probe.",
    objective:
      "Open /challenge/robots.txt, inspect its plain text, and recover the flag.",
    hint: "Robots files are public hints, not access-control systems.",
  },
  {
    id: "cipher",
    number: "03",
    name: "Cipher Node",
    vector: "Base64 decoding",
    tier: "Easy",
    points: 120,
    briefing:
      "An intercepted transmission uses Base64 encoding. Encoding is not encryption.",
    objective: "Decode the payload and submit the resulting KALIPTO{...} flag.",
    hint: "Use the site's Base64 tool or any local decoder.",
  },
  {
    id: "header",
    number: "04",
    name: "Header Specter",
    vector: "Response-header inspection",
    tier: "Medium",
    points: 160,
    briefing:
      "The fixed training probe returns a harmless clue through an HTTP response header.",
    objective:
      "Inspect GET /api/challenge/probe and find the X-Kalipto-Flag header. The in-page probe works on phones.",
    hint: "The JSON body tells you which response header to inspect.",
  },
  {
    id: "cookie",
    number: "05",
    name: "Cookie Trail",
    vector: "Client cookie inspection",
    tier: "Medium",
    points: 170,
    briefing:
      "The challenge sets a harmless, non-secret training cookie in your browser.",
    objective:
      "Read the ctf_trail cookie for this page and submit its flag value. The in-page reader works on phones.",
    hint: "Inspect document.cookie or use the built-in cookie reader below.",
  },
  {
    id: "meta",
    number: "06",
    name: "Meta Leak",
    vector: "Metadata inspection",
    tier: "Medium",
    points: 180,
    briefing:
      "A fixed training clue is embedded in a meta tag inside the page head.",
    objective:
      "Find the meta tag named ctf-clue and submit the flag it carries.",
    hint: "Look in the document head for <meta name=\"ctf-clue\">.",
  },
  {
    id: "rot13",
    number: "07",
    name: "Rotation Relay",
    vector: "ROT13 substitution",
    tier: "Hard",
    points: 220,
    briefing:
      "A classic rotation cipher scrambled this transmission. Rotation is reversible.",
    objective: "Reverse the ROT13 payload and submit the recovered flag.",
    hint: "ROT13 shifts each letter by 13 places; applying it twice restores the text.",
  },
  {
    id: "epoch",
    number: "08",
    name: "Epoch Lock",
    vector: "Timestamp conversion",
    tier: "Hard",
    points: 240,
    briefing:
      "The lock derives its flag from a Unix timestamp converted to a UTC date.",
    objective:
      "Convert the epoch to a UTC date and submit KALIPTO{EPOCH_LOCK} once you confirm the year and month.",
    hint: "Convert 1700000000 with the site's Timestamp tool; the intended flag is KALIPTO{EPOCH_LOCK}.",
  },
  {
    id: "xor",
    number: "09",
    name: "XOR Phantom",
    vector: "XOR decryption",
    tier: "Hard",
    points: 300,
    briefing:
      "A single-byte XOR obscured this transmission. XOR with the same key reverses it.",
    objective:
      "XOR each hex byte with the given key and submit the decoded flag.",
    hint: "XOR every byte with 0x2A (42), then read the ASCII characters.",
  },
  {
    id: "vault",
    number: "10",
    name: "Red Ghost Vault",
    vector: "Final identity puzzle",
    tier: "Insane",
    points: 500,
    briefing:
      "The final lock combines the interface color with the stealth identity used throughout the operation.",
    objective:
      "Submit KALIPTO{COLOR_IDENTITY} using uppercase words separated by an underscore.",
    hint: "The site is red. A hidden operator is often called a ghost.",
  },
] as const;
