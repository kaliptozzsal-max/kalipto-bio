"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRightIcon, MailIcon } from "@/components/ui/Icon";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { contactChannels, siteConfig } from "@/data/site";
import type { NavLink } from "@/lib/navigation";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Full-screen mobile navigation drawer.
 *
 * Replaces the small dropdown sheet that used to appear under the header. A
 * full-screen surface on a phone means every row can be a large, unambiguous
 * target instead of a compact list, and there is room to surface the contact
 * channels rather than hiding them behind another scroll.
 *
 * Accessibility:
 *   - `role="dialog"` + `aria-modal` so assistive tech treats the page behind
 *     it as inert.
 *   - Focus moves to the panel on open and returns to the toggle on close.
 *   - Tab is trapped inside; Escape closes.
 *   - Body scroll is locked while open, restoring the exact prior scroll
 *     position so closing never jumps the page.
 *   - Every row is at least 56px tall.
 */
export function MobileDrawer({
  open,
  onClose,
  links,
  activeId,
  isHome,
  panelId,
  returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  links: readonly NavLink[];
  activeId: string;
  isHome: boolean;
  panelId: string;
  returnFocusTo: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape to close, Tab trapped inside the panel.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        returnFocusTo.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

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
  }, [open, onClose, returnFocusTo]);

  /*
   * Lock background scroll without the usual jump.
   *
   * `overflow: hidden` alone resets the scroll position on iOS, so the page
   * would be at the top after closing. Pinning the body at a negative offset
   * holds it in place, and the offset is restored on cleanup.
   */
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Move focus into the panel once it opens.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: easeOut }}
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-void-950/85 backdrop-blur-2xl outline-none md:hidden"
        >
          {/* Clears the fixed header so the first row is never underneath it. */}
          <div className="h-[4.75rem] shrink-0" />

          <nav aria-label="Mobile" className="flex-1 px-4 pb-8">
            <m.ul
              className="flex flex-col gap-1.5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
              }}
            >
              {links.map((link) => {
                const isActive =
                  link.kind === "anchor"
                    ? isHome && activeId === link.href.replace("#", "")
                    : false;

                const href =
                  link.kind === "anchor" && !isHome ? `/${link.href}` : link.href;

                const row = (
                  <>
                    <span className="flex items-baseline gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "font-mono text-[0.6875rem] tabular-nums transition-colors duration-300",
                          isActive ? "text-electric-300" : "text-ink-faint",
                        )}
                      >
                        {String(links.indexOf(link) + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[1.375rem] font-semibold tracking-tight">
                        {link.label}
                      </span>
                    </span>
                    <ArrowRightIcon
                      aria-hidden="true"
                      className={cn(
                        "size-5 shrink-0 transition-all duration-300",
                        isActive
                          ? "translate-x-0 text-electric-300 opacity-100"
                          : "-translate-x-1 text-ink-faint opacity-0",
                      )}
                    />
                  </>
                );

                const rowClass = cn(
                  "flex min-h-[3.5rem] items-center justify-between rounded-2xl border px-4 py-3 transition-colors duration-300",
                  isActive
                    ? "border-electric-500/30 bg-electric-500/10 text-ink"
                    : "border-hairline bg-white/[0.02] text-ink-muted active:bg-white/[0.06]",
                );

                return (
                  <m.li
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.32, ease: easeOut },
                      },
                    }}
                  >
                    {link.kind === "route" ? (
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={rowClass}
                      >
                        {row}
                      </Link>
                    ) : (
                      <a href={href} onClick={onClose} className={rowClass}>
                        {row}
                      </a>
                    )}
                  </m.li>
                );
              })}
            </m.ul>

            {/* Primary action, deliberately the largest target in the drawer. */}
            <m.a
              href={isHome ? "#contact" : "/#contact"}
              onClick={onClose}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                ease: easeOut,
                delay: 0.05 + links.length * 0.045,
              }}
              className="mt-6 flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-electric-600 to-electric-700 px-5 text-[0.9375rem] font-medium text-white shadow-[0_12px_32px_-14px_rgba(10,132,255,0.9)] active:from-electric-700 active:to-electric-700"
            >
              Get in touch
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </m.a>

            {/* Contact channels — reachable without closing the drawer first. */}
            {contactChannels.length > 0 ? (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.12 + links.length * 0.045 }}
                className="mt-8 border-t border-hairline pt-6"
              >
                <h2 className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-faint uppercase">
                  Elsewhere
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {contactChannels.map((channel) => (
                    <li key={channel.label}>
                      <a
                        href={channel.href}
                        {...(channel.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        aria-label={channel.label}
                        className="grid size-12 place-items-center rounded-xl border border-hairline bg-white/[0.03] text-ink-muted transition-colors duration-300 active:bg-white/[0.08] active:text-electric-300"
                      >
                        <SocialIcon icon={channel.icon} className="size-[1.1rem]" />
                      </a>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 flex items-center gap-2 text-[0.8125rem] text-ink-faint">
                  <MailIcon aria-hidden="true" className="size-4 shrink-0" />
                  {siteConfig.location}
                </p>
              </m.div>
            ) : null}
          </nav>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
