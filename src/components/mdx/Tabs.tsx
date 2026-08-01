"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tabbed content for notes. Used as:
 *
 * ```mdx
 * <Tabs items={["npm", "yarn", "pnpm"]}>
 *   <Tab>npm install package</Tab>
 *   <Tab>yarn add package</Tab>
 *   <Tab>pnpm add package</Tab>
 * </Tabs>
 * ```
 */
export function Tabs({ items, children }: { items: string[]; children: ReactNode }) {
  const [active, setActive] = useState(0);

  // Children are Tab components — render only the active one
  const tabs = Array.isArray(children) ? children : [children];

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-hairline">
      <div className="flex overflow-x-auto border-b border-hairline bg-white/[0.02]" role="tablist">
        {items.map((label, i) => (
          <button
            key={label}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 px-4 py-2.5 text-[0.8125rem] font-medium transition-colors duration-200",
              i === active
                ? "border-b-2 border-electric-400 text-electric-200"
                : "text-ink-faint hover:text-ink-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="p-4 text-[0.9375rem] leading-relaxed text-ink-muted [&>pre]:mt-0 [&>pre]:rounded-lg [&>pre]:border-0">
        {tabs[active]}
      </div>
    </div>
  );
}

/** Individual tab content wrapper. */
export function Tab({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
