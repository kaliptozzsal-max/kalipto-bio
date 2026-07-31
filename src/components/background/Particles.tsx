"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number };

/**
 * Small drifting particles on a canvas.
 *
 * Kept deliberately restrained — no connecting lines, low opacity, slow drift —
 * so it reads as texture rather than decoration competing with the content.
 *
 * Performance and accessibility:
 * - Work starts only once the browser is idle, so it never competes with the
 *   first paint.
 * - `prefers-reduced-motion` draws one static frame instead of animating.
 * - Paused via IntersectionObserver when scrolled away and on tab blur.
 * - Device pixel ratio is capped at 2 to avoid wasting fill rate on 3x panels.
 */
export function Particles({ density = 46 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let disposed = false;

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(density * Math.min(1, Math.max(0.45, width / 1440)));

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        r: Math.random() * 1.3 + 0.5,
        a: Math.random() * 0.32 + 0.12,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const p of particles) {
        context.fillStyle = `rgba(190, 220, 255, ${p.a})`;
        context.beginPath();
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context.fill();
      }
    };

    const step = () => {
      if (disposed) return;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      draw();
      frame = visible && !document.hidden ? window.requestAnimationFrame(step) : 0;
    };

    const start = () => {
      if (disposed || reduceMotion || frame !== 0) return;
      frame = window.requestAnimationFrame(step);
    };

    const stop = () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const boot = () => {
      if (disposed) return;
      setup();
      draw();
      start();
    };

    const canIdle = typeof window.requestIdleCallback === "function";
    const idleHandle: number = canIdle
      ? window.requestIdleCallback(boot, { timeout: 1500 })
      : window.setTimeout(boot, 260);

    const onResize = () => {
      setup();
      draw();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "120px" },
    );
    observer.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (canIdle && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle);
      }
    };
  }, [density]);

  return <canvas ref={canvasRef} aria-hidden="true" className="size-full" />;
}
