import type { Transition, Variants } from "framer-motion";

/**
 * Shared Framer Motion vocabulary.
 *
 * Durations sit between 0.35s and 0.7s: long enough to read as intentional,
 * short enough that nothing ever feels like it is being waited on.
 */

/** Apple-style deceleration curve used for every entrance. */
export const easeOut = [0.16, 1, 0.3, 1] as const;

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.8,
};

export type RevealVariant =
  | "fadeIn"
  | "slideUp"
  | "scaleIn"
  | "blurReveal"
  | "rise";

/**
 * Item variants.
 *
 * `rise` moves without touching opacity. It exists for the largest text on
 * screen: an element first painted at zero opacity is not counted towards
 * Largest Contentful Paint, so fading the hero copy measurably delays it.
 */
/**
 * `visible` is a variant *function* so a per-element delay can be passed
 * through Framer's `custom` prop without discarding the variant's own duration
 * and easing (an explicit `transition` prop would replace them wholesale).
 */
export const revealVariants: Record<RevealVariant, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: (delay = 0) => ({
      opacity: 1,
      transition: { duration: 0.5, ease: easeOut, delay },
    }),
  },
  slideUp: {
    hidden: { opacity: 0, y: 24 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: easeOut, delay },
    }),
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: (delay = 0) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: easeOut, delay },
    }),
  },
  blurReveal: {
    hidden: { opacity: 0, y: 16, filter: "blur(10px)" },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.65, ease: easeOut, delay },
    }),
  },
  rise: {
    hidden: { y: 22 },
    visible: (delay = 0) => ({
      y: 0,
      transition: { duration: 0.6, ease: easeOut, delay },
    }),
  },
};

/** Parent variants that stagger their children on enter. */
export function staggerParent(stagger = 0.07, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** Shared hover lift for cards and tiles. */
export const hoverLift = {
  y: -6,
  transition: { duration: 0.3, ease: easeOut },
} as const;

/** Viewport options: animate once, a little before the element is fully visible. */
export const viewportOnce = { once: true, amount: 0.15 } as const;
