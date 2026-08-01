import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Developer Tools",
  description:
    "Free browser-based developer tools — JSON formatter, JWT decoder, Base64, UUID generator, hash generator, regex tester, timestamp converter, URL encoder, and Markdown preview. No data leaves your device.",
  alternates: { canonical: "/tools" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/tools`,
    title: `Developer Tools — ${siteConfig.name}`,
    description:
      "Free browser-based developer tools. Everything runs client-side — no data leaves your device.",
  },
};

type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

const tools: Tool[] = [
  {
    slug: "json",
    name: "JSON Formatter",
    description: "Format, minify, and validate JSON with syntax highlighting.",
    icon: "{ }",
  },
  {
    slug: "jwt",
    name: "JWT Decoder",
    description: "Decode JWT tokens and inspect header, payload, and expiry.",
    icon: "JWT",
  },
  {
    slug: "base64",
    name: "Base64",
    description: "Encode and decode Base64 strings instantly.",
    icon: "B64",
  },
  {
    slug: "uuid",
    name: "UUID Generator",
    description: "Generate v4 UUIDs — single or bulk up to 100.",
    icon: "ID",
  },
  {
    slug: "hash",
    name: "Hash Generator",
    description: "Compute MD5, SHA-1, SHA-256, and SHA-512 hashes.",
    icon: "#",
  },
  {
    slug: "regex",
    name: "Regex Tester",
    description: "Test regular expressions with live highlighting and match groups.",
    icon: ".*",
  },
  {
    slug: "timestamp",
    name: "Timestamp Converter",
    description: "Convert between Unix timestamps, ISO 8601, and human-readable dates.",
    icon: "T",
  },
  {
    slug: "url",
    name: "URL Encoder",
    description: "Encode and decode URLs and URI components.",
    icon: "%",
  },
  {
    slug: "markdown",
    name: "Markdown Preview",
    description: "Write Markdown and see a live rendered preview side by side.",
    icon: "MD",
  },
];

export default function ToolsPage() {
  return (
    <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
      <Container size="wide">
        <SectionHeading
          eyebrow="Developer Tools"
          align="left"
          title={
            <>
              Tools that run in your{" "}
              <span className="text-gradient">browser</span>
            </>
          }
          subtitle="No servers, no tracking, no data leaves your device. Built for speed and keyboard-first workflows."
        />

        <Reveal variant="fadeIn" className="mt-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-wide text-ink-faint">
            <kbd className="rounded border border-hairline bg-white/[0.05] px-1.5 py-0.5 text-[0.625rem]">
              Ctrl
            </kbd>
            +
            <kbd className="rounded border border-hairline bg-white/[0.05] px-1.5 py-0.5 text-[0.625rem]">
              Enter
            </kbd>
            <span className="text-ink-muted">to execute in any tool</span>
          </p>
        </Reveal>

        <RevealGroup
          as="ul"
          stagger={0.05}
          className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tools.map((tool) => (
            <RevealItem key={tool.slug} as="li" variant="slideUp" className="h-full">
              <GlassCard as="article" className="h-full p-0">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="flex h-full flex-col rounded-[1.25rem] p-6 sm:rounded-3xl sm:p-7"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-2xl border border-hairline-strong bg-white/[0.05] font-mono text-[0.75rem] font-bold text-electric-300"
                    >
                      {tool.icon}
                    </span>
                    <ArrowRightIcon className="size-4 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>

                  <h2 className="mt-4 text-[1.0625rem] font-semibold tracking-tight text-ink">
                    {tool.name}
                  </h2>

                  <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-muted">
                    {tool.description}
                  </p>
                </Link>
              </GlassCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </div>
  );
}
