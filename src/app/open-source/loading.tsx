import { Container } from "@/components/ui/Container";

/**
 * Skeleton shown while the open-source hub streams in.
 * Mirrors the real layout so there is no layout shift once data arrives.
 */
export default function OpenSourceLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36"
    >
      <span className="sr-only">Loading open-source projects</span>
      <Container size="wide">
        {/* Heading skeleton */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="h-7 w-36 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-10 w-80 max-w-full animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded-lg bg-white/[0.04]" />
        </div>

        {/* Controls skeleton */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div className="h-11 w-64 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="h-9 w-20 animate-pulse rounded-full bg-white/[0.04]" />
          <div className="h-9 w-20 animate-pulse rounded-full bg-white/[0.04]" />
          <div className="h-9 w-20 animate-pulse rounded-full bg-white/[0.04]" />
        </div>

        {/* Grid skeleton */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-[1.25rem] border border-hairline bg-white/[0.02] sm:rounded-3xl"
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
