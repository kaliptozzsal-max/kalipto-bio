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
  "jwt",
  "crack",
  "xorkey",
  "chain",
] as const;

export type ChallengeLevelId = (typeof CHALLENGE_LEVEL_IDS)[number];

export type ChallengeTier = "Medium" | "Hard" | "Insane" | "Operator";

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

/**
 * Fixed, precomputed puzzle payloads. Every value is a scrambled/encoded form
 * of a training flag — no real secret is exposed by any of these.
 */
export const CIPHER_TRANSMISSION = "UzBGTVNWQlVUM3RFVDFWQ1RFVmZRalkwZlE9PQ==";
export const ROT13_TRANSMISSION = "zp{x!%~L#~%cf0|x##~#N";
export const BASE32_TRANSMISSION = "JNAUYSKQKRHXWQSBKNCTGMS7JZHUIRL5";
export const XOR_TRANSMISSION =
  "0c 09 03 1a 04 13 07 34 0b 1b 15 17 08 1b 1b 14 1c 10 18 11 1e 35";
export const VAULT_TRANSMISSION = "fUFWTlVQX1JZQ1ZFR3tCR0NWWU5Y";
export const VIGENERE_TRANSMISSION = "MMJRBHVVGUNQNIU";
export const VIGENERE_KEY = "REDNODE";

/** Operator-tier payloads. All fixed; nothing here exposes a real secret. */
export const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoiZ3Vlc3QifQ.jET63ZQk3xQ5gvw6y9bjMVd4tGcPMrfYFT_BA36p5AM";
export const JWT_SECRET = "kalipto";
export const HASHCRACK_TARGET =
  "a3ee76bc34cc901c001c6d6ca332c0eb14d6ad825ebe529a531482859344d885";
export const XORKEY_TRANSMISSION =
  "19 72 08 1b 63 10 1d 48 1c 1d 61 1b 19 76 1d 0d 61 77 16 4e";

export const tierOrder: readonly ChallengeTier[] = [
  "Medium",
  "Hard",
  "Insane",
  "Operator",
];

export const challengeLevels: readonly ChallengeLevel[] = [
  {
    id: "source",
    number: "01",
    name: "Split Ghost",
    vector: "DOM reconnaissance",
    tier: "Medium",
    points: 200,
    briefing:
      "The flag was split into two halves and hidden in separate data attributes so a casual glance misses it.",
    objective:
      "Find both data-ctf-part-1 and data-ctf-part-2 in the rendered HTML, concatenate them in order, and submit the result.",
    hint: "Search the DOM for elements with data-ctf-part-1 and data-ctf-part-2, then join the two values.",
  },
  {
    id: "robots",
    number: "02",
    name: "Robots Whisper",
    vector: "Base64 in public text",
    tier: "Medium",
    points: 220,
    briefing:
      "A fictional crawler policy hides a Base64 string in a comment. Encoding is not secrecy.",
    objective:
      "Open /challenge/robots.txt, extract the Base64 blob from the comment, decode it, and submit the flag.",
    hint: "The commented value is standard Base64. Decode it to reveal KALIPTO{...}.",
  },
  {
    id: "cipher",
    number: "03",
    name: "Double Cipher",
    vector: "Layered Base64",
    tier: "Medium",
    points: 240,
    briefing:
      "This transmission was Base64-encoded twice. One decode is never enough.",
    objective:
      "Decode the payload, notice the result is still Base64, decode again, and submit the flag.",
    hint: "Decode with the Base64 tool, feed the output back into it, and decode a second time.",
  },
  {
    id: "header",
    number: "04",
    name: "Hex Specter",
    vector: "Hex-encoded response header",
    tier: "Hard",
    points: 300,
    briefing:
      "The training probe returns the flag hex-encoded inside a response header, not the body.",
    objective:
      "Inspect GET /api/challenge/probe, read the X-Kalipto-Hex header, convert the hex bytes to ASCII, and submit the flag.",
    hint: "Each pair of hex characters is one ASCII byte. The in-page probe shows the header value.",
  },
  {
    id: "cookie",
    number: "05",
    name: "Cookie Trail",
    vector: "Base64url cookie",
    tier: "Hard",
    points: 320,
    briefing:
      "A training cookie holds the flag in Base64url — the URL-safe variant with - and _ instead of + and /.",
    objective:
      "Run the probe, read the ctf_trail cookie, decode it as Base64url, and submit the flag.",
    hint: "Base64url uses - and _ and drops padding. Convert it to standard Base64 or use a Base64url decoder.",
  },
  {
    id: "meta",
    number: "06",
    name: "Vigenere Meta",
    vector: "Vigenere cipher",
    tier: "Hard",
    points: 380,
    briefing:
      "A meta tag carries a Vigenere-encrypted word. The repeating key is provided; the wrapper KALIPTO{...} is not encrypted.",
    objective:
      "Decrypt the ctf-clue meta value with the key REDNODE and submit KALIPTO{DECRYPTED}.",
    hint: "Vigenere decrypt: plain[i] = (cipher[i] - key[i]) mod 26. Wrap the decrypted word in KALIPTO{...}.",
  },
  {
    id: "rot13",
    number: "07",
    name: "ROT47 Mirror",
    vector: "ROT47 substitution",
    tier: "Hard",
    points: 400,
    briefing:
      "Not ROT13. This uses ROT47, which rotates the full printable ASCII range, braces and underscores included.",
    objective:
      "Apply ROT47 (rotate by 47 within ASCII 33-126) to the payload and submit the recovered flag.",
    hint: "ROT47 is its own inverse over ASCII 33..126. Applying it again restores the original text.",
  },
  {
    id: "epoch",
    number: "08",
    name: "Base32 Node",
    vector: "Base32 decoding",
    tier: "Insane",
    points: 460,
    briefing:
      "This uses Base32 (RFC 4648), not Base64. The alphabet is A-Z and 2-7 with = padding.",
    objective:
      "Decode the Base32 payload to ASCII and submit the flag.",
    hint: "Base32 packs 5 bits per character. Use a Base32 decoder, not Base64.",
  },
  {
    id: "xor",
    number: "09",
    name: "XOR Phantom",
    vector: "Repeating-key XOR",
    tier: "Insane",
    points: 520,
    briefing:
      "A multi-byte repeating key XORed this transmission. A single byte will not do it.",
    objective:
      "Recover the 5-character key using the known prefix KALIPTO{, decrypt the full buffer, and submit the flag.",
    hint: "key[i] = cipher[i] XOR knownPlain[i] over the first 8 bytes. The key repeats every 5 bytes.",
  },
  {
    id: "vault",
    number: "10",
    name: "Triple Chain",
    vector: "Multi-round decode chain",
    tier: "Insane",
    points: 650,
    briefing:
      "Three transforms were stacked. Peel them in the exact reverse order they were applied.",
    objective:
      "The payload is base64( reverse( rot13( flag ) ) ). Reverse each step — Base64 decode, reverse the string, then ROT13 — and submit the flag.",
    hint: "Order matters: Base64-decode first, reverse the characters, then apply ROT13.",
  },
  {
    id: "jwt",
    number: "11",
    name: "Token Forge",
    vector: "JWT / HS256 analysis",
    tier: "Operator",
    points: 700,
    briefing:
      "A HS256 JSON Web Token was issued to a guest. The signing secret leaked. Understand how the signature is built.",
    objective:
      "Decode the token, recompute a valid HS256 signature for a payload where role is admin using the leaked secret, and submit KALIPTO{FORGED_ADMIN}.",
    hint: "signature = base64url(HMAC-SHA256(header + '.' + payload, secret)). Secret is provided below. Change role to admin and re-sign.",
  },
  {
    id: "crack",
    number: "12",
    name: "Hash Crack",
    vector: "Brute-force / SHA-256",
    tier: "Operator",
    points: 800,
    briefing:
      "A 4-digit numeric PIN was hashed with a single unsalted SHA-256 pass — exactly why fast hashes are unsafe for secrets.",
    objective:
      "Recover the PIN by brute forcing all 0000-9999 against the target digest, then submit KALIPTO{PIN} with the digits.",
    hint: "Only 10,000 candidates. Loop each, sha256 it, compare to the target. A few lines in any language.",
  },
  {
    id: "xorkey",
    number: "13",
    name: "Key Recovery",
    vector: "Known-plaintext / repeating-key XOR",
    tier: "Operator",
    points: 900,
    briefing:
      "This ciphertext uses a short repeating-key XOR. Every KALIPTO flag begins with a known prefix — that is enough to recover the key.",
    objective:
      "Use the known plaintext 'KALIPTO{' against the first bytes to recover the repeating key, decrypt the rest, and submit the flag.",
    hint: "key[i] = cipher[i] XOR knownPlain[i]. The key is 3 uppercase characters and repeats. Decrypt the full buffer with it.",
  },
  {
    id: "chain",
    number: "14",
    name: "Operator Ascended",
    vector: "Multi-step reasoning",
    tier: "Operator",
    points: 1200,
    briefing:
      "The final lock only opens for an operator who cleared the whole ladder. Combine what the journey taught you.",
    objective:
      "Once every prior flag is solved, submit KALIPTO{OPERATOR_ASCENDED}.",
    hint: "You earned this rank by finishing the operation. Submit the ascended operator flag.",
  },
] as const;
