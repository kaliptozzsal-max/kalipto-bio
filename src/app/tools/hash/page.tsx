import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { HashTool } from "./HashTool";

export const metadata: Metadata = {
  title: "Hash Generator",
  description: "Compute MD5, SHA-1, SHA-256, and SHA-512 hashes using the Web Crypto API.",
  alternates: { canonical: "/tools/hash" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/hash`,
    title: `Hash Generator — ${siteConfig.name}`,
    description: "Compute MD5, SHA-1, SHA-256, and SHA-512 hashes in your browser.",
  },
};

export default function Page() {
  return <HashTool />;
}
