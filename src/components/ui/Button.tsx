"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2 " +
  "rounded-xl border font-semibold isolate " +
  "transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "border-electric-500/60 bg-gradient-to-br from-electric-600 to-electric-700 text-white " +
    "shadow-[0_14px_34px_-18px_rgba(201,31,54,0.85)] " +
    "hover:border-electric-400/70 hover:shadow-[0_18px_42px_-18px_rgba(201,31,54,0.95)]",
  secondary:
    "border-hairline-strong bg-white/[0.045] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] " +
    "hover:border-white/[0.22] hover:bg-white/[0.075]",
  ghost:
    "border-transparent bg-transparent text-ink-muted hover:bg-white/[0.05] hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-[0.8125rem] lg:h-9",
  md: "h-12 px-5 text-sm lg:h-11",
  lg: "h-13 px-6 text-[0.9375rem] sm:px-7",
};

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

function Inner({ iconLeft, iconRight, children }: CommonProps) {
  return (
    <>
      {iconLeft ? (
        <span className="shrink-0 [&>svg]:size-[1.05em]">{iconLeft}</span>
      ) : null}
      <span>{children}</span>
      {iconRight ? (
        <span className="shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 [&>svg]:size-[1.05em]">
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

  const classes = cn(base, variants[variant], sizes[size], className);
  const inner = (
    <Inner iconLeft={iconLeft} iconRight={iconRight}>
      {children}
    </Inner>
  );

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
        <a
          className={classes}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
        >
          {inner}
        </a>
      );
    }

    if (href.startsWith("#")) {
      return (
        <a className={classes} href={href} aria-label={ariaLabel}>
          {inner}
        </a>
      );
    }

    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {inner}
      </Link>
    );
  }

  const { type = "button", disabled, onClick } = props;

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled}
      aria-label={props["aria-label"]}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}
