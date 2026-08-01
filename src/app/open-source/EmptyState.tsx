import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRightIcon, TerminalIcon } from "@/components/ui/Icon";

/**
 * Shown when GitHub is not configured or there are zero repos matching filters.
 */
export function EmptyState({ filtered = false }: { filtered?: boolean }) {
  return (
    <Reveal variant="slideUp" className="mt-14">
      <GlassCard interactive={false} className="p-8 sm:p-10">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl border border-hairline-strong bg-white/[0.05] text-electric-300"
          >
            <TerminalIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-[1.0625rem] font-semibold text-ink">
              {filtered ? "No matching projects" : "Nothing published yet"}
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
              {filtered
                ? "Try adjusting your search or clearing the filters."
                : "Open-source projects will appear here once they are public on GitHub."}
            </p>
            {!filtered && (
              <div className="mt-6">
                <Button href="/#focus" size="sm" iconRight={<ArrowRightIcon />}>
                  See my current focus
                </Button>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </Reveal>
  );
}
