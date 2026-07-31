import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRightIcon, MapPinIcon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { contactChannels, siteConfig } from "@/data/site";
import { ContactForm } from "./ContactForm";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative scroll-mt-28 py-28 sm:py-36"
    >
      <Container>
        <SectionHeading
          eyebrow="Contact"
          id="contact-title"
          title={
            <>
              Get in <span className="text-gradient">touch</span>
            </>
          }
          subtitle="Happy to talk about security, AI, automation or clinical technology — or just to compare notes on something you're learning."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* ---------- Channels + location ---------- */}
          <div className="flex flex-col gap-4">
            <Reveal variant="slideUp">
              <GlassCard
                interactive={false}
                className="p-6 sm:p-7"
                accent="from-electric-500/12 via-electric-500/4 to-transparent"
              >
                <h3 className="text-[0.75rem] font-medium tracking-[0.14em] text-ink-muted uppercase">
                  Direct channels
                </h3>

                <RevealGroup
                  as="ul"
                  stagger={0.05}
                  className="mt-5 flex flex-col gap-2"
                >
                  {contactChannels.map((channel) => (
                    <RevealItem key={channel.label} as="li" variant="fadeIn">
                      <a
                        href={channel.href}
                        {...(channel.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="group flex items-center gap-3.5 rounded-2xl border border-transparent px-3 py-3 transition-[background-color,border-color] duration-300 hover:border-hairline hover:bg-white/[0.04]"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-9 shrink-0 place-items-center rounded-xl border border-hairline bg-white/[0.04] text-ink-muted transition-colors duration-300 group-hover:border-electric-400/40 group-hover:text-electric-300"
                        >
                          <SocialIcon icon={channel.icon} className="size-4" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.875rem] font-medium text-ink">
                            {channel.label}
                          </span>
                          <span className="block truncate font-mono text-[0.6875rem] text-ink-faint">
                            {channel.handle}
                          </span>
                        </span>

                        <ArrowRightIcon
                          aria-hidden="true"
                          className="size-4 shrink-0 -translate-x-1 text-ink-faint opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </a>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </GlassCard>
            </Reveal>

            <Reveal variant="slideUp" delay={0.06}>
              <GlassCard interactive={false} className="p-6 sm:p-7">
                <h3 className="text-[0.75rem] font-medium tracking-[0.14em] text-ink-muted uppercase">
                  Location
                </h3>
                <p className="mt-4 flex items-center gap-2.5 text-[0.9375rem] font-medium text-ink">
                  <MapPinIcon
                    aria-hidden="true"
                    className="size-4 text-electric-300"
                  />
                  {siteConfig.location}
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                  Working remotely across time zones. Telegram is usually the
                  quickest way to reach me.
                </p>
              </GlassCard>
            </Reveal>
          </div>

          {/* ---------- Form ---------- */}
          <Reveal variant="blurReveal" delay={0.08}>
            <GlassCard interactive={false} className="p-6 sm:p-8">
              <h3 className="text-[0.75rem] font-medium tracking-[0.14em] text-ink-muted uppercase">
                Send a message
              </h3>
              <div className="mt-6">
                <ContactForm />
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
