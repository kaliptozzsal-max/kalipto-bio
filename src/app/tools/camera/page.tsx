import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { CameraTool } from "./CameraTool";

export const metadata: Metadata = {
  title: "Camera Lab — Private Photo & Video",
  description:
    "Take photos and record short silent videos locally in your browser. Camera media never leaves your device.",
  alternates: { canonical: "/tools/camera" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/camera`,
    title: `Camera Lab — ${siteConfig.name}`,
    description:
      "A privacy-first browser camera for local photos and silent video recordings. Nothing is uploaded.",
  },
};

export default function Page() {
  return <CameraTool />;
}
