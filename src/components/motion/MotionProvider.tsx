"use client";

import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Framer Motion runtime for the whole app.
 *
 * `LazyMotion` + the `m` component ship only the features actually used —
 * animations, exit animations and pointer gestures — instead of the full
 * `motion` bundle, which also carries drag support and layout projection.
 * `strict` makes an accidental `motion.*` import fail loudly rather than
 * silently undoing that saving.
 *
 * The bundle is loaded synchronously. An async loader was measured and made no
 * difference to shipped bytes or Lighthouse, so the simpler form is kept.
 *
 * `reducedMotion="user"` is the accessibility switch: when the operating system
 * asks for reduced motion, Framer skips transform-based animation globally, so
 * no component needs its own branch — which also keeps server and client markup
 * identical and avoids hydration mismatches.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
