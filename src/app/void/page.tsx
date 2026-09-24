import type { Metadata } from "next";
import { VoidGate } from "@/components/void/VoidGate";

/**
 * Hidden route. Not in navigation, not in the sitemap, and explicitly noindex.
 * It is reachable only by someone who solved the master challenge and holds the
 * unlock token. This is deliberate obscurity, not cryptographic protection —
 * the gate is a client convenience; the master flag is what actually matters.
 */
export const metadata: Metadata = {
  title: "//void",
  description: "",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "/void" },
};

export default function VoidPage() {
  return <VoidGate />;
}
