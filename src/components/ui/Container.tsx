import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  size?: "default" | "wide" | "narrow";
};

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export function Container({
  children,
  className,
  as: Tag = "div",
  size = "default",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        // 16px gutter below 400px so narrow phones get back 8px of content
        // width, stepping up to the unchanged 32px from `sm` upward.
        "mx-auto w-full px-4 min-[400px]:px-5 sm:px-8",
        sizes[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
