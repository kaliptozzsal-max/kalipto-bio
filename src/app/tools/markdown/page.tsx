import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { MarkdownTool } from "./MarkdownTool";

export const metadata: Metadata = {
  title: "Markdown Preview",
  description: "Write Markdown and see a live rendered preview. Copy the generated HTML.",
  alternates: { canonical: "/tools/markdown" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/markdown`,
    title: `Markdown Preview — ${siteConfig.name}`,
    description: "Write Markdown and see a live rendered preview side by side.",
  },
};

export default function Page() {
  return <MarkdownTool />;
}
