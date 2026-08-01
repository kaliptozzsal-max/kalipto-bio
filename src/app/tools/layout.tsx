import type { ReactNode } from "react";

/**
 * Tools layout — a simple pass-through that enables the loading.tsx skeleton
 * at the segment level without affecting the root layout.
 */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
