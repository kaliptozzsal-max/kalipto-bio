"use client";

import { useEffect, useRef } from "react";

/**
 * Soft light that follows the pointer.
 *
 * Written to be genuinely cheap:
 * - Position is written to CSS custom properties, so only the compositor is
 *   involved. No React state, therefore no re-renders on pointer move.
 * - Updates are coalesced into one `requestAnimationFrame` per frame.
 * - Only attaches on devices with a fine pointer, and never when reduced motion
 *   is requested — on touch there is no cursor to follow.
 */
export function MouseSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!finePointer || reduceMotion) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      element.style.setProperty("--spotlight-x", `${x}px`);
      element.style.setProperty("--spotlight-y", `${y}px`);
      element.style.setProperty("--spotlight-opacity", "1");
    };

    const onPointerMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    const onPointerLeave = () => {
      element.style.setProperty("--spotlight-opacity", "0");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[var(--spotlight-opacity,0)] transition-opacity duration-700 [background:radial-gradient(28rem_28rem_at_var(--spotlight-x,50%)_var(--spotlight-y,50%),rgba(10,132,255,0.10),transparent_70%)]"
    />
  );
}
