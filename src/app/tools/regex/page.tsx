import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { RegexTool } from "./RegexTool";

export const metadata: Metadata = {
  title: "Regex Tester",
  description: "Test regular expressions with live match highlighting and capture groups.",
  alternates: { canonical: "/tools/regex" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/regex`,
    title: `Regex Tester — ${siteConfig.name}`,
    description: "Test regular expressions with live highlighting and match groups.",
  },
};

export default function Page() {
  return <RegexTool />;
}
