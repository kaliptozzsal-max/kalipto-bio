import type { Metadata } from "next";
import { ChallengeArena } from "@/components/challenge/ChallengeArena";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Breach Challenge",
  description:
    "A safe isolated ten-level CTF spanning easy to insane: source, robots, decoding, header, cookie, metadata, rotation, timestamp, XOR, and a final vault. No real systems are targeted.",
  alternates: { canonical: "/challenge" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/challenge`,
    title: `Breach Challenge — ${siteConfig.name}`,
    description:
      "Capture ten harmless flags across four difficulty tiers in Kalipto's isolated mobile-friendly CTF sandbox.",
  },
  // Vigenere Meta level clue — ciphertext, decrypted with key REDNODE.
  other: { "ctf-clue": "MMJRBHVVGUNQNIU" },
};

export default function ChallengePage() {
  return (
    <>
      {/* Split Ghost: the flag is split across two attributes and must be joined. */}
      <span hidden aria-hidden="true" data-ctf-part-1="KALIPTO{SPLIT_" />
      <span hidden aria-hidden="true" data-ctf-part-2="DOM_GHOST}" />
      <ChallengeArena />
    </>
  );
}
