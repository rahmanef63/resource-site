import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  className,
  bordered = true,
  ...props
}: React.HTMLAttributes<HTMLElement> & { bordered?: boolean }) {
  return (
    <section
      className={cn(bordered && "border-b-2 border-foreground", className)}
      {...props}
    />
  );
}

/** Container uses --density-y so presets can control section rhythm. */
export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 md:px-12 lg:px-16 py-[var(--density-y)]", className)}
      {...props}
    />
  );
}
