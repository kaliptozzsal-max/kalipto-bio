"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import {
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2 " +
  "overflow-hidden rounded-full font-medium isolate " +
  "transition-[box-shadow,background-color,border-color,color] duration-300 ease-out " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-45";

/*
 * The primary fill is a gradient between electric-600 and electric-700. Both
 * ends clear 5:1 contrast against white text, whereas the brighter electric-500
 * only reaches 3.6:1 and would fail WCAG AA. Hover intensifies the glow rather
 * than lightening the fill, so contrast is constant in every state.
 */
const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-electric-600 via-electric-600 to-electric-700 text-white " +
    "shadow-[0_10px_30px_-14px_rgba(10,132,255,0.85)] " +
    "hover:shadow-[0_18px_46px_-14px_rgba(10,132,255,1)]",
  secondary:
    "glass lit-edge text-ink hover:border-hairline-strong hover:bg-white/[0.07]",
  ghost:
    "border border-transparent text-ink-muted hover:bg-white/[0.05] hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.9375rem]",
};

type Ripple = { id: number; x: number; y: number };

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
  ariaLabel?: string;
  /** Renders a non-interactive placeholder. */
  disabled?: boolean;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** How far the button leans toward the cursor, in px. */
const MAGNET_STRENGTH = 4;

/**
 * Shared interaction layer: magnetic lean toward the pointer, scale feedback,
 * glow on hover and a ripple from the click position.
 *
 * The magnet offset is applied with a motion value on the wrapper so it never
 * triggers a React re-render while the pointer moves.
 */
function useButtonInteractions() {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<readonly Ripple[]>([]);

  /**
   * Cached on enter rather than read per move. `getBoundingClientRect()` forces
   * a synchronous layout, so calling it on every pointermove is a guaranteed
   * reflow on a hot path.
   */
  const rectRef = useRef<DOMRect | null>(null);

  const onPointerEnter = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    rectRef.current = ref.current?.getBoundingClientRect() ?? null;
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    // Coarse pointers have no hover state to speak of.
    if (event.pointerType !== "mouse") return;

    const rect = rectRef.current;
    if (!rect) return;

    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    setOffset({
      x: Math.max(-1, Math.min(1, dx)) * MAGNET_STRENGTH,
      y: Math.max(-1, Math.min(1, dy)) * MAGNET_STRENGTH,
    });
  }, []);

  const onPointerLeave = useCallback(() => {
    rectRef.current = null;
    setOffset({ x: 0, y: 0 });
  }, []);

  const spawnRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const id = Date.now() + Math.random();

    setRipples((current) => [
      ...current,
      { id, x: event.clientX - rect.left, y: event.clientY - rect.top },
    ]);

    window.setTimeout(
      () => setRipples((current) => current.filter((r) => r.id !== id)),
      620,
    );
  }, []);

  return {
    ref,
    offset,
    ripples,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    spawnRipple,
  };
}

function Ripples({ ripples }: { ripples: readonly Ripple[] }) {
  return (
    <AnimatePresence>
      {ripples.map((ripple) => (
        <m.span
          key={ripple.id}
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 size-5 rounded-full bg-white/25"
          style={{ left: ripple.x - 10, top: ripple.y - 10 }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 9, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
}

function Inner({ iconLeft, iconRight, children }: CommonProps) {
  return (
    <>
      {iconLeft ? (
        <span className="shrink-0 [&>svg]:size-[1.05em]">{iconLeft}</span>
      ) : null}
      <span>{children}</span>
      {iconRight ? (
        <span className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 [&>svg]:size-[1.05em]">
          {iconRight}
        </span>
      ) : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    iconLeft,
    iconRight,
  } = props;

  const {
    ref,
    offset,
    ripples,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    spawnRipple,
  } = useButtonInteractions();

  const classes = cn(base, variants[variant], sizes[size], className);
  const inner = (
    <Inner iconLeft={iconLeft} iconRight={iconRight}>
      {children}
    </Inner>
  );

  /** Motion + pointer props shared by every rendered element. */
  const motionProps = {
    animate: { x: offset.x, y: offset.y },
    whileHover: { scale: 1.025 },
    whileTap: { scale: 0.975 },
    transition: { type: "spring" as const, stiffness: 320, damping: 22 },
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    onClick: spawnRipple,
  };

  if (props.href !== undefined) {
    const { href, external, ariaLabel, disabled } = props;

    if (disabled) {
      return (
        <span
          className={classes}
          role="link"
          aria-disabled="true"
          aria-label={ariaLabel}
        >
          {inner}
        </span>
      );
    }

    if (external) {
      return (
        <m.a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          {...motionProps}
        >
          {inner}
          <Ripples ripples={ripples} />
        </m.a>
      );
    }

    /*
     * Same-page anchors use a plain <a>. Routing them through next/link makes
     * the router prefetch the current route on mount — a real network request
     * for a jump that never leaves the page.
     */
    if (href.startsWith("#")) {
      return (
        <m.a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          href={href}
          aria-label={ariaLabel}
          {...motionProps}
        >
          {inner}
          <Ripples ripples={ripples} />
        </m.a>
      );
    }

    return (
      <Link href={href} aria-label={ariaLabel} className="contents">
        <m.span
          ref={ref as React.Ref<HTMLSpanElement>}
          className={classes}
          {...motionProps}
        >
          {inner}
          <Ripples ripples={ripples} />
        </m.span>
      </Link>
    );
  }

  const { type = "button", disabled, onClick } = props;

  return (
    <m.button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      type={type}
      disabled={disabled}
      aria-label={props["aria-label"]}
      {...motionProps}
      onClick={(event) => {
        spawnRipple(event);
        onClick?.();
      }}
    >
      {inner}
      <Ripples ripples={ripples} />
    </m.button>
  );
}
