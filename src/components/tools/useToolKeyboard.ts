"use client";

import { useEffect } from "react";

/**
 * Registers a Ctrl+Enter (or Cmd+Enter on Mac) keyboard shortcut
 * that calls the provided handler. Used in every tool for "execute".
 */
export function useToolKeyboard(handler: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handler();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}
