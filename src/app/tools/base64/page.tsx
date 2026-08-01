import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { Base64Tool } from "./Base64Tool";

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder",
  description: "Encode and decode Base64 strings instantly in your browser.",
  alternates: { canonical: "/tools/base64" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools/base64`,
    title: `Base64 Encoder/Decoder — ${siteConfig.name}`,
    description: "Encode and decode Base64 strings. No data leaves your device.",
  },
};

export default function Page() {
  return <Base64Tool />;
}
