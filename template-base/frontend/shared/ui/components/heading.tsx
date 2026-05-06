import * as React from "react";
import { cn } from "@/lib/utils";

type Level = 1 | 2 | 3 | 4;

const SIZE: Record<Level, string> = {
  1: "text-4xl md:text-5xl lg:text-6xl leading-tight",
  2: "text-3xl md:text-4xl leading-tight",
  3: "text-2xl md:text-3xl leading-tight",
  4: "text-xl md:text-2xl leading-tight",
};

export function Heading({
  level = 2,
  className,
  children,
  ...props
}: { level?: Level; className?: string } & React.HTMLAttributes<HTMLHeadingElement> & {
    children: React.ReactNode;
  }) {
  const Tag = (`h${level}`) as "h1" | "h2" | "h3" | "h4";
  return (
    <Tag className={cn("font-serif", SIZE[level], className)} {...props}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block border-2 border-foreground rounded-sm px-3 py-1 text-[10px] uppercase tracking-brutal font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
