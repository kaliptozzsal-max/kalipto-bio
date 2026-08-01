import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { JwtTool } from "./JwtTool";

export const metadata: Metadata = {
  title: "JWT Decoder",
  description: "Decode JSON Web Tokens and inspect header, payload, and expiry. Client-side only — your tokens stay private.",
  alternates: { canonical: "/tools/jwt" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/jwt`,
    title: `JWT Decoder — ${siteConfig.name}`,
    description: "Decode JWT tokens and inspect header, payload, and expiry.",
  },
};

export default function Page() {
  return <JwtTool />;
}
