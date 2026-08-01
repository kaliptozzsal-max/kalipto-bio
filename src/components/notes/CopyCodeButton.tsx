"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches copy buttons to all `<pre>` elements inside the MDX content.
 * Runs client-side after hydration. Targets `.mdx-content pre` elements.
 */
export function CopyCodeButton() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const container = document.querySelector(".mdx-content");
    if (!container) return;

    const pres = container.querySelectorAll("pre");
    pres.forEach((pre) => {
      if (pre.querySelector("[data-copy-btn]")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "relative group/code";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement("button");
      btn.setAttribute("data-copy-btn", "");
      btn.setAttribute("aria-label", "Copy code");
      btn.className =
        "absolute top-2.5 right-2.5 z-10 inline-flex h-7 items-center gap-1 rounded-md border border-hairline bg-void-950/80 px-2 text-[0.6875rem] font-medium text-ink-faint opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/code:opacity-100 hover:text-ink focus:opacity-100";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        });
      });
      wrapper.appendChild(btn);
    });
  }, []);

  return null;
}
