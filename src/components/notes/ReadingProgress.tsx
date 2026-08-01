"use client";

import { m, useScroll } from "framer-motion";

/**
 * Reading progress bar fixed at the very top of the viewport.
 * Grows from left to right as the user scrolls through the article.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <m.div
      aria-hidden="true"
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 right-0 left-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-electric-500 via-cyber-cyan to-electric-400 print:hidden"
    />
  );
}
