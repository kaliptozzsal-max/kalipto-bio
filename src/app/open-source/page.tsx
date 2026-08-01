import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/data/site";
import { fetchAllRepos, isGitHubConfigured } from "@/lib/github";
import { OpenSourceHub } from "./OpenSourceHub";
import { EmptyState } from "./EmptyState";

export const metadata: Metadata = {
  title: "Open Source",
  description:
    "Explore my open-source projects — security tools, AI experiments, automation scripts, and web applications. All pulled live from GitHub.",
  alternates: { canonical: "/open-source" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/open-source`,
    title: `Open Source — ${siteConfig.name}`,
    description:
      "Explore my open-source projects — security tools, AI experiments, automation scripts, and web applications.",
  },
};

export default async function OpenSourcePage() {
  if (!isGitHubConfigured()) {
    return (
      <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
        <Container>
          <SectionHeading
            eyebrow="Open Source"
            align="left"
            title={
              <>
                My <span className="text-gradient">open-source</span> work
              </>
            }
            subtitle="Projects, tools, and experiments — all public, all real."
          />
          <EmptyState />
        </Container>
      </div>
    );
  }

  const repos = await fetchAllRepos();

  return (
    <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
      <Container size="wide">
        <SectionHeading
          eyebrow="Open Source"
          align="left"
          title={
            <>
              My <span className="text-gradient">open-source</span> work
            </>
          }
          subtitle="Projects, tools, and experiments — all public, all real. Pulled live from GitHub so this list is always current."
        />
        <OpenSourceHub repos={repos} />
      </Container>
    </div>
  );
}
