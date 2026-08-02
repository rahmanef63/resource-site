// glass-desktop — WidgetShell (Build Plan §6.1). The glass card, and nothing more.
// Presentational: renders ONLY the glass surface. It does NOT set grid
// position/size — the SpaceCanvas owns placement and passes it via `style`.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface WidgetShellProps {
  /** aria-label for the group + gallery caption. Not rendered visually. */
  title: string;
  /** Pill geometry (radius-pill) instead of the default rounded widget. */
  pill?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * The Lucent glass card. Glass fill gradient (glass-hi → glass-lo) over a
 * blurred/saturated backdrop, 1px hairline, widget/pill radius, widget shadow.
 * Hover raises the hairline to --color-hairline-hover over --duration-micro,
 * gated by prefers-reduced-motion (the transition only runs motion-safe).
 * `contain: layout paint` isolates each card from its neighbours.
 */
export function WidgetShell({ title, pill = false, className, style, children }: WidgetShellProps) {
  return (
    <div
      role="group"
      aria-label={title}
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden p-3",
        "border border-solid [border-color:var(--color-hairline)]",
        "hover:[border-color:var(--color-hairline-hover)]",
        "motion-safe:transition-[border-color]",
        "motion-safe:[transition-duration:var(--duration-micro)]",
        "motion-safe:[transition-timing-function:var(--ease-settle)]",
        className,
      )}
      style={{
        borderRadius: pill ? "var(--radius-pill)" : "var(--radius-widget)",
        background: "linear-gradient(var(--color-glass-hi), var(--color-glass-lo))",
        backdropFilter: "blur(var(--blur-glass)) saturate(140%)",
        WebkitBackdropFilter: "blur(var(--blur-glass)) saturate(140%)",
        boxShadow: "var(--shadow-widget)",
        contain: "layout paint",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
