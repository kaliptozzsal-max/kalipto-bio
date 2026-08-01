import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { UrlTool } from "./UrlTool";

export const metadata: Metadata = {
  title: "URL Encoder/Decoder",
  description: "Encode and decode URLs and URI components instantly.",
  alternates: { canonical: "/tools/url" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/url`,
    title: `URL Encoder/Decoder — ${siteConfig.name}`,
    description: "Encode and decode URLs and URI components.",
  },
};

export default function Page() {
  return <UrlTool />;
}
