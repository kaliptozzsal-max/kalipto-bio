"use client";

import { AnimatePresence, m, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/Icon";
import { siteConfig } from "@/data/site";
import type { NavLink } from "@/lib/navigation";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Ignore jitter below this many px so the bar doesn't flicker. */
const HIDE_THRESHOLD = 8;

export function Navbar({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  /**
   * Section anchors only resolve on the home page, so from any other route they
   * are rewritten to `/#section`. Same-document fragment navigation still
   * smooth-scrolls when you are already on `/`.
   */
  const hrefFor = (link: NavLink) =>
    link.kind === "anchor" && !isHome ? `/${link.href}` : link.href;

  const sectionKey = links
    .filter((link) => link.kind === "anchor")
    .map((link) => link.href.replace("#", ""))
    .join(",");
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /*
   * Raw scroll progress, no spring. `useScroll` writes straight to a motion
   * value, which sets the transform without a React render. A spring on top
   * would add a rAF loop that keeps ticking after every scroll event — a real
   * main-thread cost for a 2px bar that is already smooth.
   */
  const { scrollYProgress } = useScroll();

  /**
   * Condense once the hero starts leaving, and hide while scrolling down /
   * reveal while scrolling up. Reads are batched into rAF so the listener never
   * causes layout thrash.
   */
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;

      setCondensed(y > 24);

      if (Math.abs(delta) > HIDE_THRESHOLD) {
        // Never hide near the very top, and never while the sheet is open.
        setHidden(delta > 0 && y > 140);
        lastY = y;
      }
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Highlight the section currently in view. Keyed on a joined string so the
  // effect depends on a stable value rather than a fresh array each render.
  useEffect(() => {
    const elements = sectionKey
      .split(",")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(best.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sectionKey]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Escape closes the sheet; Tab is trapped inside while it is open.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables =
        panelRef.current?.querySelectorAll<HTMLElement>("a[href], button");
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  // Prevent background scroll while the sheet is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <m.header
      className="fixed inset-x-0 top-0 z-50"
      // Derived rather than stored: the bar must never slide away while the
      // mobile sheet is open, and deriving it avoids a second state update.
      animate={{ y: hidden && !menuOpen ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: easeOut }}
    >
      {/* Reading progress */}
      <m.div
        aria-hidden="true"
        style={{ scaleX: scrollYProgress }}
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-electric-500 via-cyber-cyan to-electric-400"
      />

      <div
        className={cn(
          "transition-[padding] duration-500 ease-out",
          condensed ? "py-2.5" : "py-4",
        )}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "mx-auto flex w-[min(100%-1.5rem,72rem)] items-center justify-between rounded-full px-4 transition-all duration-500 ease-out sm:px-5",
            condensed
              ? "h-14 glass-strong shadow-[0_18px_50px_-28px_rgba(0,0,0,0.9)]"
              : "h-16 border border-transparent bg-transparent",
          )}
        >
          <a
            href={isHome ? "#top" : "/"}
            className="group flex items-center gap-2.5 rounded-full py-1 pr-2 text-[0.9375rem] font-semibold tracking-tight"
          >
            <span
              aria-hidden="true"
              className="relative grid size-8 place-items-center rounded-xl bg-electric-500/15 ring-1 ring-electric-400/40"
            >
              <span className="font-mono text-xs font-bold text-electric-300">
                K
              </span>
              <span className="absolute inset-0 rounded-xl bg-electric-400/25 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <span>{siteConfig.name}</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const isActive =
                link.kind === "anchor"
                  ? isHome && active === link.href.replace("#", "")
                  : pathname.startsWith(link.href);

              const inner = (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 -z-10 rounded-full border transition-[opacity,transform,border-color,background-color] duration-300 ease-out",
                      isActive
                        ? "scale-100 border-electric-500/25 bg-electric-500/12 opacity-100"
                        : "scale-90 border-transparent bg-transparent opacity-0",
                    )}
                  />
                  {link.label}
                </>
              );

              const className = cn(
                "relative inline-flex h-9 items-center rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors duration-300",
                isActive ? "text-ink" : "text-ink-muted hover:text-ink",
              );

              return (
                <li key={link.href}>
                  {/* Real route changes go through next/link so they prefetch;
                      same-page anchors stay plain <a> to avoid a pointless
                      prefetch of the current route. */}
                  {link.kind === "route" ? (
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={className}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <a
                      href={hrefFor(link)}
                      aria-current={isActive ? "true" : undefined}
                      className={className}
                    >
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={isHome ? "#contact" : "/#contact"}
              className="hidden h-9 items-center rounded-full bg-gradient-to-br from-electric-600 to-electric-700 px-4 text-[0.8125rem] font-medium text-white shadow-[0_8px_24px_-12px_rgba(10,132,255,0.9)] transition-shadow duration-300 hover:shadow-[0_14px_34px_-10px_rgba(10,132,255,1)] sm:inline-flex"
            >
              Get in touch
            </a>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid size-10 place-items-center rounded-full border border-hairline bg-white/[0.04] text-ink transition-colors duration-300 hover:bg-white/[0.08] md:hidden"
            >
              {menuOpen ? (
                <CloseIcon className="size-5" />
              ) : (
                <MenuIcon className="size-5" />
              )}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <m.button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="fixed inset-0 -z-10 w-full cursor-default bg-void-950/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
            <m.div
              id="mobile-nav"
              ref={panelRef}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: easeOut }}
              className="mx-auto w-[min(100%-1.5rem,72rem)] overflow-hidden rounded-3xl glass-strong p-3 md:hidden"
            >
              <ul className="flex flex-col">
                {links.map((link) => {
                  const rowClass =
                    "flex items-center justify-between rounded-2xl px-4 py-3.5 text-[0.9375rem] font-medium text-ink-muted transition-colors duration-300 hover:bg-white/[0.05] hover:text-ink";
                  const hint = (
                    <span
                      aria-hidden="true"
                      className="font-mono text-[0.625rem] text-ink-faint"
                    >
                      {link.href}
                    </span>
                  );

                  return (
                    <li key={link.href}>
                      {link.kind === "route" ? (
                        <Link
                          href={link.href}
                          onClick={closeMenu}
                          className={rowClass}
                        >
                          {link.label}
                          {hint}
                        </Link>
                      ) : (
                        <a
                          href={hrefFor(link)}
                          onClick={closeMenu}
                          className={rowClass}
                        >
                          {link.label}
                          {hint}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
              <a
                href={isHome ? "#contact" : "/#contact"}
                onClick={closeMenu}
                className="mt-2 flex h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-600 to-electric-700 text-sm font-medium text-white shadow-[0_10px_30px_-14px_rgba(10,132,255,0.9)]"
              >
                Get in touch
              </a>
            </m.div>
          </>
        ) : null}
      </AnimatePresence>
    </m.header>
  );
}
