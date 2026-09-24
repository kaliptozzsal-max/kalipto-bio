"use client";

import { m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
} from "react";

const MAX_TILT = 9;

/**
 * High-resolution profile art with compositor-only 3D tilt and parallax.
 * Pointer updates write CSS variables in one animation frame without React
 * renders. Touch devices keep the layered composition, and reduced-motion users
 * receive a completely static card.
 */
export function CyberProfileCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const resetTilt = useCallback(() => {
    cancelFrame();
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--shine-x", "50%");
    card.style.setProperty("--shine-y", "42%");
  }, [cancelFrame]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (reduceMotion || event.pointerType !== "mouse") return;

      const card = cardRef.current;
      if (!card) return;

      const bounds = card.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(1, (event.clientX - bounds.left) / bounds.width),
      );
      const y = Math.max(
        0,
        Math.min(1, (event.clientY - bounds.top) / bounds.height),
      );
      const rotateX = (0.5 - y) * MAX_TILT;
      const rotateY = (x - 0.5) * MAX_TILT;

      cancelFrame();
      frameRef.current = window.requestAnimationFrame(() => {
        card.style.setProperty("--tilt-x", `${rotateX}deg`);
        card.style.setProperty("--tilt-y", `${rotateY}deg`);
        card.style.setProperty("--shine-x", `${x * 100}%`);
        card.style.setProperty("--shine-y", `${y * 100}%`);
        frameRef.current = null;
      });
    },
    [cancelFrame, reduceMotion],
  );

  useEffect(() => cancelFrame, [cancelFrame]);

  return (
    <div className="w-full [perspective:1200px]">
      <m.div
        animate={reduceMotion ? { y: 0 } : { y: [0, -8, 0] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 6, ease: "easeInOut", repeat: Infinity }
        }
      >
        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          className="group relative aspect-square w-full [transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] [transform-style:preserve-3d] transition-transform duration-200 ease-out motion-reduce:transform-none"
        >
          <div
            aria-hidden="true"
            className="absolute inset-5 rotate-6 rounded-[2.5rem] border border-electric-500/25 bg-electric-500/[0.055] shadow-[0_35px_90px_-35px_rgba(201,31,54,0.75)] [transform:translateZ(-34px)] sm:rounded-[3rem]"
          />

          <figure className="absolute inset-0 overflow-hidden rounded-[2rem] border border-hairline-strong bg-void-900 shadow-[0_40px_100px_-42px_rgba(201,31,54,0.88)] [backface-visibility:hidden] [transform:translateZ(22px)] sm:rounded-[3rem]">
            <Image
              src="/images/kalipto-hacker-4k.webp"
              alt="Red-tinted vintage eye and zodiac artwork used as Kalipto's cybersecurity profile image"
              width={3840}
              height={3840}
              sizes="(max-width: 639px) 20rem, (max-width: 1023px) 23rem, 27rem"
              fetchPriority="high"
              loading="eager"
              draggable={false}
              className="h-full w-full object-cover contrast-[1.04] saturate-[1.05] transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transform-none"
            />

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--shine-x,50%)_var(--shine-y,42%),rgba(255,255,255,0.2),rgba(229,45,67,0.08)_20%,transparent_48%)] opacity-65 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_4px)] opacity-50 mix-blend-overlay"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_42%,rgba(7,6,7,0.62)_100%)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[0.08]"
            />

            <span
              aria-hidden="true"
              className="absolute top-[19%] -left-4 h-1 w-24 bg-electric-400/80 shadow-[0_0_18px_rgba(249,79,97,0.8)] transition-transform duration-500 group-hover:translate-x-7"
            />
            <span
              aria-hidden="true"
              className="absolute right-5 bottom-[22%] h-0.5 w-16 bg-electric-300/70 shadow-[0_0_14px_rgba(249,79,97,0.75)] transition-transform duration-500 group-hover:-translate-x-5"
            />
          </figure>

          <div className="absolute -top-3 left-5 inline-flex items-center gap-2 rounded-xl border border-electric-500/30 bg-void-900/95 px-3 py-2 text-[0.6875rem] font-semibold tracking-[0.1em] text-electric-100 uppercase shadow-xl backdrop-blur-md [transform:translateZ(72px)] sm:left-8">
            <span className="size-1.5 rounded-full bg-electric-400 shadow-[0_0_12px_rgba(249,79,97,1)]" />
            Kalipto // dark web
          </div>

          <div className="absolute -right-2 bottom-5 rounded-xl border border-electric-500/25 bg-void-900/95 px-3 py-2 text-xs font-semibold text-ink shadow-xl backdrop-blur-md [transform:translateZ(82px)] sm:-right-4 sm:bottom-8">
            4K · 3D · Secure
          </div>

          <span
            aria-hidden="true"
            className="absolute top-5 right-5 size-8 border-t-2 border-r-2 border-electric-300/70 [transform:translateZ(58px)] sm:top-7 sm:right-7"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-5 left-5 size-8 border-b-2 border-l-2 border-electric-300/70 [transform:translateZ(58px)] sm:bottom-7 sm:left-7"
          />
        </div>
      </m.div>
    </div>
  );
}
