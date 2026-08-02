import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Canonical panel chrome for docs pages — `rounded-lg border bg-card`.
 * Owns only the surface (radius + border + card background); padding and
 * layout stay caller-controlled via `className` (twMerge → last wins), so a
 * future restyle of every doc panel (shadow, radius, tint) is one edit here.
 *
 * Use instead of hand-rolling the same three classes inline. Forwards all
 * native div props + ref (React 19 ref-as-prop).
 */
export function DocCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)} {...props} />
  );
}
