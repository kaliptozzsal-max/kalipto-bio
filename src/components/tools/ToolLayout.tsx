"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon } from "@/components/ui/Icon";

type ToolLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * Shared shell for every developer tool.
 * Provides consistent heading, back navigation, and container.
 */
export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
      <Container>
        <div className="mb-8 sm:mb-10">
          <Link
            href="/tools"
            className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-muted transition-colors duration-300 hover:text-electric-300"
          >
            <ArrowLeftIcon className="size-3.5" />
            All tools
          </Link>
          <h1 className="text-[clamp(1.5rem,5vw,2rem)] leading-tight font-semibold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
            {description}
          </p>
        </div>
        {children}
      </Container>
    </div>
  );
}
