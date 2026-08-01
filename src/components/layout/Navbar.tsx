"use client";

import { m, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { siteConfig } from "@/data/site";
import type { NavLink } from "@/lib/navigation";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { MenuToggle } from "./MenuToggle";
import { MobileDrawer } from "./MobileDrawer";

/** Ignore jitter below this many px so the bar doesn't flicker. */
const HIDE_THRESHOLD = 8;

export function Navbar({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const drawerId = useId();

  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const toggleRef = useRef<HTMLButtonElement>(null);

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

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-50"
        // Derived rather than stored: the bar must never slide away while the
        // mobile drawer is open, and deriving it avoids a second state update.
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
            condensed ? "py-2.5" : "py-3 sm:py-4",
          )}
        >
          <nav
            aria-label="Primary"
            className={cn(
              "mx-auto flex w-[min(100%-1rem,72rem)] items-center justify-between rounded-full px-3 transition-all duration-500 ease-out min-[400px]:w-[min(100%-1.5rem,72rem)] sm:px-5",
              condensed
                ? "h-14 glass-strong shadow-[0_18px_50px_-28px_rgba(0,0,0,0.9)]"
                : "h-14 border border-transparent bg-transparent sm:h-16",
              // The drawer sits above the page but below the header; while it is
              // open the bar always uses its solid treatment so the two read as
              // one surface.
              menuOpen && "glass-strong",
            )}
          >
            <a
              href={isHome ? "#top" : "/"}
              className="group flex min-h-11 items-center gap-2.5 rounded-full py-1 pr-2 text-[0.9375rem] font-semibold tracking-tight"
            >
              <span
                aria-hidden="true"
                className="relative grid size-8 shrink-0 place-items-center rounded-xl bg-electric-500/15 ring-1 ring-electric-400/40"
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

                // h-11 on tablet clears the touch minimum; pinned back to the
                // original h-9 from lg so the desktop bar is unchanged.
                const className = cn(
                  "relative inline-flex h-11 items-center rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors duration-300 lg:h-9",
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
                className="hidden h-11 items-center rounded-full bg-gradient-to-br from-electric-600 to-electric-700 px-4 text-[0.8125rem] font-medium text-white shadow-[0_8px_24px_-12px_rgba(10,132,255,0.9)] transition-shadow duration-300 hover:shadow-[0_14px_34px_-10px_rgba(10,132,255,1)] sm:inline-flex lg:h-9"
              >
                Get in touch
              </a>

              <MenuToggle
                ref={toggleRef}
                open={menuOpen}
                onToggle={() => setMenuOpen((open) => !open)}
                controls={drawerId}
              />
            </div>
          </nav>
        </div>
      </m.header>

      <MobileDrawer
        open={menuOpen}
        onClose={closeMenu}
        links={links}
        activeId={active}
        isHome={isHome}
        panelId={drawerId}
        returnFocusTo={toggleRef}
      />
    </>
  );
}
