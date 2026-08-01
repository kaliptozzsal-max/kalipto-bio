import { SiGithub } from "react-icons/si";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { ExternalLinkIcon, ForkIcon, StarIcon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { siteConfig } from "@/data/site";
import {
  fetchRepos,
  isGitHubConfigured,
  languageColor,
  relativeTime,
} from "@/lib/github";

/**
 * Projects, read live from the GitHub API.
 *
 * Nothing here is hand-maintained, which is the point: the list cannot drift
 * from what actually exists. If no username is configured the section does not
 * render at all; if the API call fails we still render the heading and a link to
 * the profile, so the `#projects` anchor in the navigation always has a target.
 */
export async function Projects() {
  if (!isGitHubConfigured()) return null;

  const repos = await fetchRepos();
  const profileUrl = `https://github.com/${siteConfig.githubUsername}`;

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative scroll-mt-24 py-16 sm:py-24 lg:scroll-mt-28 lg:py-36"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow="Projects"
          id="projects-title"
          title={
            <>
              What I&apos;m <span className="text-gradient">building</span>
            </>
          }
          subtitle="Pulled straight from GitHub, so this list is always whatever I'm actually working on."
        />

        {repos.length === 0 ? (
          // Configured, but the fetch came back empty — either there are no
          // public repos yet or GitHub rate-limited the build.
          <div className="mt-14 flex justify-center">
            <Button href={profileUrl} external iconLeft={<SiGithub />}>
              Browse my GitHub
            </Button>
          </div>
        ) : (
          <>
            <RevealGroup
              as="ul"
              stagger={0.07}
              className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3"
            >
              {repos.map((repo) => (
                <RevealItem
                  key={repo.id}
                  as="li"
                  variant="slideUp"
                  className="h-full"
                >
                  <GlassCard
                    as="article"
                    className="flex h-full flex-col p-6 sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 text-[1.0625rem] leading-snug font-semibold tracking-tight text-ink">
                        <span className="break-words">{repo.name}</span>
                      </h3>

                      <div
                        aria-hidden="true"
                        className="flex shrink-0 items-center gap-3 pt-0.5 font-mono text-[0.6875rem] text-ink-faint"
                      >
                        {repo.stars > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <StarIcon className="size-3.5" />
                            {repo.stars}
                          </span>
                        ) : null}
                        {repo.forks > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <ForkIcon className="size-3.5" />
                            {repo.forks}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Screen-reader equivalent of the icon-only counts above. */}
                    {repo.stars > 0 || repo.forks > 0 ? (
                      <p className="sr-only">
                        {repo.stars} stars, {repo.forks} forks
                      </p>
                    ) : null}

                    <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-ink-muted">
                      {repo.description ?? (
                        <span className="text-ink-faint italic">
                          No description on GitHub yet.
                        </span>
                      )}
                    </p>

                    {repo.topics.length > 0 ? (
                      <ul
                        aria-label={`${repo.name} topics`}
                        className="mt-5 flex flex-wrap gap-1.5"
                      >
                        {repo.topics.slice(0, 4).map((topic) => (
                          <li key={topic}>
                            <Tag>{topic}</Tag>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-6 flex items-center gap-3 border-t border-hairline pt-5 font-mono text-[0.6875rem] text-ink-faint">
                      {repo.language ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: languageColor(repo.language),
                            }}
                          />
                          {repo.language}
                        </span>
                      ) : null}
                      <span>Updated {relativeTime(repo.pushedAt)}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Button
                        href={repo.url}
                        external
                        variant="secondary"
                        size="sm"
                        iconLeft={<SiGithub />}
                        ariaLabel={`View the ${repo.name} source on GitHub`}
                      >
                        Source
                      </Button>

                      {repo.demoUrl ? (
                        <Button
                          href={repo.demoUrl}
                          external
                          variant="ghost"
                          size="sm"
                          iconRight={<ExternalLinkIcon />}
                          ariaLabel={`Open the ${repo.name} live demo`}
                        >
                          Live Demo
                        </Button>
                      ) : null}
                    </div>
                  </GlassCard>
                </RevealItem>
              ))}
            </RevealGroup>

            <div className="mt-12 flex justify-center">
              <Button
                href={profileUrl}
                external
                variant="secondary"
                iconLeft={<SiGithub />}
              >
                See everything on GitHub
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
