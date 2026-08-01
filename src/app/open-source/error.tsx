"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertIcon } from "@/components/ui/Icon";

/**
 * Error boundary for the /open-source route.
 * Renders a recovery UI rather than crashing the whole page.
 */
export default function OpenSourceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
      <Container>
        <GlassCard interactive={false} className="p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl border border-hairline-strong bg-white/[0.05] text-amber-400"
            >
              <AlertIcon className="size-5" />
            </span>
            <div>
              <h2 className="text-[1.0625rem] font-semibold text-ink">
                Failed to load repositories
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                Something went wrong while fetching data from GitHub. This is
                usually temporary — try again in a moment.
              </p>
              <div className="mt-6">
                <Button size="sm" variant="secondary" onClick={() => reset()}>
                  Try again
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </Container>
    </div>
  );
}
