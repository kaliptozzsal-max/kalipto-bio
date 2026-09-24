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
  // Meta Leak level clue — a fixed, non-secret training flag.
  other: { "ctf-clue": "KALIPTO{META_LEAK}" },
};

export default function ChallengePage() {
  return (
    <>
      <span hidden aria-hidden="true" data-ctf-flag="KALIPTO{SOURCE_GHOST}" />
      <ChallengeArena />
    </>
  );
}
