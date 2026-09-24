"use client";

import { useEffect } from "react";

/**
 * Sets `data-page-hidden` on <body> while the tab is not visible, so CSS can
 * pause decorative infinite animations and stop wasting GPU/paint work in
 * background tabs. Renders nothing.
 */
export function VisibilityFlag() {
  useEffect(() => {
    const apply = () => {
      document.body.dataset.pageHidden = document.hidden ? "true" : "false";
    };
    apply();
    document.addEventListener("visibilitychange", apply);
    return () => document.removeEventListener("visibilitychange", apply);
  }, []);

  return null;
}
