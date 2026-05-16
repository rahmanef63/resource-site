import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Shared chrome for every "preview / detail / inspector" surface in Rahman Resources.
 * Mirrors shadcn/ui's card style on https://ui.shadcn.com/charts and /blocks:
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ [icon] LABEL                              [View Code ↗]  │  <- header strip
 *   ├──────────────────────────────────────────────────────────┤
 *   │                                                          │
 *   │                       body content                       │
 *   │                                                          │
 *   ├──────────────────────────────────────────────────────────┤
 *   │ optional footer                                          │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Body padding varies by `variant`:
 *   - "iframe" → p-0  (full-bleed for PreviewFrame / IframeThumbnail)
 *   - "code"   → p-0  (CodeBlock self-styles)
 *   - "static" → p-4  (text + grid content)
 */
export type ShowcaseCardVariant = "iframe" | "code" | "static";

export function ShowcaseCard({
  icon: Icon,
  label,
  badge,
  actions,
  variant = "static",
  className,
  bodyClassName,
  footer,
  children,
}: {
  icon?: LucideIcon;
  label: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: ShowcaseCardVariant;
  className?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const bodyPad =
    variant === "iframe" || variant === "code" ? "p-0" : "p-4";
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 shadow-none",
        className,
      )}
    >
      <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b bg-muted/30 px-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && (
            <Icon className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        )}
      </div>
      <div className={cn(bodyPad, bodyClassName)}>{children}</div>
      {footer && (
        <div className="flex h-9 shrink-0 items-center border-t bg-muted/20 px-3 text-[11px] text-muted-foreground">
          {footer}
        </div>
      )}
    </Card>
  );
}
