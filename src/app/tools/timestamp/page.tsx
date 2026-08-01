import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { TimestampTool } from "./TimestampTool";

export const metadata: Metadata = {
  title: "Timestamp Converter",
  description: "Convert between Unix timestamps, ISO 8601, and human-readable dates.",
  alternates: { canonical: "/tools/timestamp" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/timestamp`,
    title: `Timestamp Converter — ${siteConfig.name}`,
    description: "Convert between Unix timestamps, ISO 8601, and human-readable dates.",
  },
};

export default function Page() {
  return <TimestampTool />;
}
