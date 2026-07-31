"use client";

import dynamic from "next/dynamic";
import { FloatingShapes } from "./FloatingShapes";
import { MouseSpotlight } from "./MouseSpotlight";

/**
 * Canvas particles are the one purely decorative part heavy enough to be worth
 * splitting out. Loading it on demand keeps it out of the initial bundle.
 */
const Particles = dynamic(
  () => import("./Particles").then((mod) => mod.Particles),
  { ssr: false },
);

/**
 * Fixed backdrop shared by every section: mesh gradient, aurora wash, drifting
 * shapes, particles, a subtle grid and a fine noise layer to stop the gradients
 * from banding.
 *
 * Layered as one fixed element rather than per-section backgrounds so the page
 * scrolls over a single continuous surface, and so there is exactly one canvas
 * and one pointer listener on the page.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Mesh gradient base */}
      <div className="absolute inset-0 bg-mesh" />

      {/* Aurora pools */}
      <div className="absolute -top-1/4 left-1/2 h-[42rem] w-[52rem] -translate-x-1/2 rounded-full bg-electric-600/16 blur-[150px]" />

      <FloatingShapes />

      {/* Blueprint grid, faded away from the centre */}
      <div className="absolute inset-0 bg-grid mask-radial-fade opacity-60" />

      {/* Particles */}
      <div className="absolute inset-0 mask-radial-fade">
        <Particles />
      </div>

      {/* Light that follows the cursor (fine pointers only) */}
      <MouseSpotlight />

      {/* Film grain */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-soft-light" />

      {/* Vignette so text always keeps contrast over the wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_40%,transparent_40%,rgba(4,6,11,0.7)_100%)]" />
    </div>
  );
}
