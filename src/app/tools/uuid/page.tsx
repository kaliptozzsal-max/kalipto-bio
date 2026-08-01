import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { UuidTool } from "./UuidTool";

export const metadata: Metadata = {
  title: "UUID Generator",
  description: "Generate v4 UUIDs — single or bulk up to 100. Copy with one click.",
  alternates: { canonical: "/tools/uuid" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/uuid`,
    title: `UUID Generator — ${siteConfig.name}`,
    description: "Generate v4 UUIDs instantly in your browser.",
  },
};

export default function Page() {
  return <UuidTool />;
}
