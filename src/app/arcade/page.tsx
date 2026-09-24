import type { Metadata } from "next";
import { ArcadeExperience } from "@/components/arcade/ArcadeExperience";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Hacker Arcade",
  description:
    "Five safe educational cybersecurity games with local XP, levels, achievements, streaks, and high scores. No real targets or command execution.",
  alternates: { canonical: "/arcade" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/arcade`,
    title: `Hacker Arcade — ${siteConfig.name}`,
    description:
      "Train with safe terminal, firewall, cipher, password, and security quiz simulations. Progress stays in your browser.",
  },
};

export default function ArcadePage() {
  return <ArcadeExperience />;
}
