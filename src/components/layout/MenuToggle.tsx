"use client";

import { m } from "framer-motion";
import { easeOut } from "@/lib/motion";

/**
 * Animated hamburger that morphs into a close icon.
 *
 * Two bars rather than three: they translate to the centre and cross, which
 * reads as a single continuous gesture. A third bar would have to fade out
 * separately and always looks like a hiccup at this size.
 *
 * The button is 44x44 so it clears the touch minimum, while the bars stay 18px
 * wide so it still looks small and precise.
 */
export function MenuToggle({
  open,
  onToggle,
  controls,
  ref,
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
  /** React 19 accepts `ref` as an ordinary prop — no forwardRef needed. */
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const bar =
    "absolute left-0 h-[1.5px] w-full origin-center rounded-full bg-current";

  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? "Close menu" : "Open menu"}
      className="relative grid size-11 shrink-0 place-items-center rounded-full border border-hairline bg-white/[0.04] text-ink transition-colors duration-300 active:bg-white/[0.09] md:hidden"
    >
      <span aria-hidden="true" className="relative block h-[10px] w-[18px]">
        <m.span
          className={bar}
          initial={false}
          animate={open ? { top: 4.25, rotate: 45 } : { top: 0, rotate: 0 }}
          transition={{ duration: 0.28, ease: easeOut }}
        />
        <m.span
          className={bar}
          initial={false}
          animate={open ? { top: 4.25, rotate: -45 } : { top: 8.5, rotate: 0 }}
          transition={{ duration: 0.28, ease: easeOut }}
        />
      </span>
    </button>
  );
}
