import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { ProxyTool } from "./ProxyTool";

export const metadata: Metadata = {
  title: "Proxy Scraper",
  description: "Scrape and list free HTTP, SOCKS4, and SOCKS5 proxies from public sources.",
  alternates: { canonical: "/tools/proxy" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/proxy`,
    title: `Proxy Scraper — ${siteConfig.name}`,
    description: "Access a real-time list of free proxies for your scraping needs.",
  },
};

export default function Page() {
  return <ProxyTool />;
}
