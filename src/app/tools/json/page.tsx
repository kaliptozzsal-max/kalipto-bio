import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { JsonTool } from "./JsonTool";

export const metadata: Metadata = {
  title: "JSON Formatter",
  description: "Format, minify, and validate JSON with syntax highlighting. Runs entirely in your browser.",
  alternates: { canonical: "/tools/json" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/json`,
    title: `JSON Formatter — ${siteConfig.name}`,
    description: "Format, minify, and validate JSON. No data leaves your device.",
  },
};

export default function Page() {
  return <JsonTool />;
}
