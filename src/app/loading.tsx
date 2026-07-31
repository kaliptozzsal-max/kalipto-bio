/**
 * Route-level loading UI, shown while a segment streams in.
 *
 * Deliberately CSS-only and *not* a full-screen curtain over already-rendered
 * content: an opaque overlay on top of the hero pushes Largest Contentful
 * Paint out by however long it stays up. This renders in place of the page,
 * so it never delays content that is already available.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex min-h-svh items-center justify-center overflow-hidden"
    >
      <span className="sr-only">Loading</span>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid mask-radial-fade opacity-50" />
        <div className="absolute top-1/3 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-electric-600/15 blur-[130px]" />
      </div>

      <div aria-hidden="true" className="relative flex flex-col items-center gap-6">
        <span className="relative grid size-14 place-items-center rounded-2xl border border-electric-400/30 bg-electric-500/10">
          <span className="font-display text-lg font-semibold text-electric-200">
            K
          </span>
          <span className="absolute inset-0 rounded-2xl border border-electric-400/50 animate-pulse-glow" />
        </span>

        {/* Indeterminate progress track */}
        <span className="relative block h-px w-32 overflow-hidden bg-white/10">
          <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-electric-400 to-transparent animate-track" />
        </span>
      </div>
    </div>
  );
}
