import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, MapPinIcon } from "@/components/ui/Icon";
import { siteConfig } from "@/data/site";
import { CyberProfileCard } from "./CyberProfileCard";

const terminalLines = [
  "[OK] identity verified // node KALIPTO",
  "[OK] zero-trust interface online",
  "[OK] secure build pipeline armed",
] as const;

/** Dark-web identity hero with an animated 3D cybersecurity profile. */
export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 max-[820px]:landscape:min-h-0 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
    >
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-4 hidden -translate-y-1/2 font-mono text-[0.5625rem] tracking-[0.22em] text-electric-400/30 uppercase [writing-mode:vertical-rl] xl:block"
      >
        ident://kalipto · node_01 · access_verified
      </div>
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-4 hidden -translate-y-1/2 rotate-180 font-mono text-[0.5625rem] tracking-[0.22em] text-electric-400/30 uppercase [writing-mode:vertical-rl] xl:block"
      >
        cipher://aes-256 · tls_1.3 · trace_null
      </div>

      <Container size="wide">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.75fr)] lg:gap-16 xl:gap-24">
          <RevealGroup
            stagger={0.075}
            className="flex max-w-3xl flex-col items-start text-left"
          >
            <RevealItem variant="fadeIn">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-electric-500/25 bg-black/30 px-3.5 py-2 font-mono text-[0.6875rem] font-semibold tracking-[0.12em] text-electric-200 uppercase shadow-[inset_0_0_18px_rgba(201,31,54,0.06)] backdrop-blur-md">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 animate-pulse rounded-full bg-electric-400 shadow-[0_0_12px_rgba(249,79,97,0.9)]"
                />
                System online · always building
              </p>
            </RevealItem>

            <RevealItem variant="rise">
              <h1
                id="hero-title"
                className="mt-6 text-[clamp(4rem,12vw,8.75rem)] leading-[0.86] font-semibold tracking-[-0.07em] sm:mt-8 lg:text-[clamp(5.5rem,9.5vw,8.75rem)]"
              >
                <span
                  data-text={siteConfig.name}
                  className="cyber-glitch relative inline-block text-gradient"
                >
                  {siteConfig.name}
                </span>
              </h1>
            </RevealItem>

            <RevealItem variant="rise">
              <p className="mt-7 max-w-2xl text-balance text-xl leading-tight font-medium tracking-[-0.025em] text-ink sm:text-2xl sm:leading-snug">
                Building secure, intelligent systems for real-world problems.
              </p>
            </RevealItem>

            <RevealItem variant="rise">
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Specialties">
                {siteConfig.roles.map((role, index) => (
                  <li
                    key={role}
                    className="group/role inline-flex items-center gap-2 rounded-lg border border-hairline bg-black/25 px-3 py-1.5 text-[0.8125rem] font-medium text-ink-muted transition-colors hover:border-electric-500/30 hover:text-ink"
                  >
                    <span className="font-mono text-[0.625rem] text-electric-400/75">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {role}
                  </li>
                ))}
              </ul>
            </RevealItem>

            <RevealItem variant="rise">
              <p className="mt-7 max-w-2xl text-pretty text-[0.9375rem] leading-[1.75] text-ink-muted sm:text-base">
                I build intelligent software, automate complex workflows,
                research cybersecurity, and develop AI-powered solutions that
                bridge healthcare and modern technology. My focus is secure,
                efficient, and scalable work that makes a practical difference.
              </p>
            </RevealItem>

            <RevealItem variant="fadeIn" className="w-full max-w-xl">
              <div className="mt-7 overflow-hidden rounded-xl border border-electric-500/20 bg-black/35 shadow-[inset_0_0_30px_rgba(201,31,54,0.035)] backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-hairline px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="size-1.5 rounded-full bg-electric-500/80" />
                    <span className="size-1.5 rounded-full bg-electric-700/70" />
                    <span className="size-1.5 rounded-full bg-white/20" />
                  </div>
                  <p className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink-faint uppercase">
                    kalipto_secure_shell // tty-01
                  </p>
                </div>

                <div className="px-3.5 py-3 font-mono text-[0.6875rem] leading-relaxed sm:px-4">
                  <p className="flex min-w-0 items-center gap-2 text-ink-muted">
                    <span className="shrink-0 text-electric-300">root@kalipto:~$</span>
                    <span className="terminal-typewriter text-ink">
                      initialize encrypted workspace...
                    </span>
                  </p>
                  <div className="hero-terminal-feed mt-2 text-electric-300/80">
                    {terminalLines.map((line, index) => (
                      <p
                        key={line}
                        className="hero-terminal-line"
                        style={{ animationDelay: `${index * 4}s` }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </RevealItem>

            <RevealItem variant="slideUp" className="w-full sm:w-auto">
              <div className="mt-9 flex w-full max-w-sm flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center">
                <Button
                  href="#focus"
                  size="lg"
                  iconRight={<ArrowRightIcon />}
                  className="w-full sm:w-auto"
                >
                  Explore my work
                </Button>
                <Button
                  href="#contact"
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Get in touch
                </Button>
              </div>
            </RevealItem>

            <RevealItem variant="fadeIn">
              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.6875rem] tracking-[0.08em] text-ink-faint uppercase">
                <p className="inline-flex items-center gap-2">
                  <MapPinIcon className="size-4 shrink-0 text-electric-300" />
                  Node: {siteConfig.location}
                </p>
                <span aria-hidden="true" className="hidden h-3 w-px bg-hairline sm:block" />
                <p className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-electric-400 shadow-[0_0_8px_rgba(249,79,97,0.8)]" />
                  Threat level: controlled
                </p>
              </div>
            </RevealItem>
          </RevealGroup>

          <Reveal
            variant="scaleIn"
            className="relative mx-auto w-full max-w-[20rem] sm:max-w-[23rem] lg:max-w-[27rem]"
          >
            <CyberProfileCard />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
