"use client";

import { m, useInView } from "framer-motion";
import { useRef, type ElementType, type ReactNode } from "react";
import {
  revealVariants,
  staggerParent,
  viewportOnce,
  type RevealVariant,
} from "@/lib/motion";

type Tag = "div" | "section" | "ul" | "ol" | "li" | "span" | "p" | "h2" | "h3";

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: Tag;
  /** Seconds between each child's entrance. */
  stagger?: number;
  /** Seconds to wait before the first child animates. */
  delay?: number;
};

/**
 * Scroll-triggered container that staggers its children.
 *
 * One observer covers the whole group, so a twelve-tile grid costs a single
 * IntersectionObserver rather than twelve.
 *
 * `useInView` is used instead of `whileInView` because the `whileInView` prop
 * lives in Framer's `inView` feature, which is only bundled with `domMax` — the
 * heavier bundle that also drags in layout projection. This hook is public API
 * and works with the lean `domAnimation` bundle.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
  stagger = 0.07,
  delay = 0,
}: RevealGroupProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, viewportOnce);
  const MotionTag = m[as] as ElementType;

  return (
    <MotionTag
      ref={ref}
      className={className}
      data-reveal=""
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerParent(stagger, delay)}
    >
      {children}
    </MotionTag>
  );
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: Tag;
  variant?: RevealVariant;
};

/** A single staggered child. Must sit inside a `RevealGroup`. */
export function RevealItem({
  children,
  className,
  as = "div",
  variant = "slideUp",
}: RevealItemProps) {
  const MotionTag = m[as] as ElementType;

  return (
    <MotionTag
      className={className}
      data-reveal=""
      variants={revealVariants[variant]}
    >
      {children}
    </MotionTag>
  );
}

type RevealProps = RevealItemProps & {
  /** Seconds to wait before animating. */
  delay?: number;
};

/**
 * Convenience wrapper for a single element that is not part of a stagger group.
 */
export function Reveal({
  children,
  className,
  as = "div",
  variant = "slideUp",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, viewportOnce);
  const MotionTag = m[as] as ElementType;

  return (
    <MotionTag
      ref={ref}
      className={className}
      data-reveal=""
      custom={delay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={revealVariants[variant]}
    >
      {children}
    </MotionTag>
  );
}
