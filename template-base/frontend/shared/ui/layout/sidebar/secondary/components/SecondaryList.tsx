/**
 * SecondaryList Component
 *
 * Universal list component that renders items using the variant registry.
 * Supports loading states, error handling, empty states, and virtualization.
 *
 * @author SuperSpace Team
 * @version 1.0.0
 */

"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  itemVariantRegistry,
  type SecondaryItem,
  type RenderUtils,
  type RenderCtx,
} from "../lib/variant-registry";

export interface SecondaryListProps {
  /** Items to render */
  items: SecondaryItem[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | Error;
  /** Empty state component */
  emptyState?: ReactNode;
  /** Empty state text (simple alternative) */
  emptyText?: string;
  /** Fallback renderer for unknown variants */
  renderUnknown?: (ctx: RenderCtx) => ReactNode;
  /** Action handler */
  onAction?: (id: string, action: string, extra?: any) => void;
  /** Optional slots for all items */
  slots?: {
    leading?: ReactNode;
    trailing?: ReactNode;
    badge?: ReactNode;
  };
  /** Utility functions */
  utils?: Partial<RenderUtils>;
  /** Additional class name */
  className?: string;
  /** Enable virtualization for large lists */
  virtualize?: boolean;
  /** Number of loading skeletons to show */
  loadingCount?: number;
}

/**
 * Default utility implementations
 */
const defaultUtils: RenderUtils = {
  t: (key: string, params?: any) => {
    // TODO: Integrate with actual i18n
    return key;
  },
  formatTime: (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return iso;
    }
  },
  formatCurrency: (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  },
};

/**
 * Default unknown variant renderer
 */
function DefaultUnknownRenderer({ item }: RenderCtx) {
  return (
    <div className="px-3 py-2 text-sm text-muted-foreground border border-dashed rounded-md">
      <div className="font-medium">Unknown variant: {String(item.variantId)}</div>
      <div className="text-xs">ID: {item.id}</div>
    </div>
  );
}

/**
 * Default empty state
 */
function DefaultEmptyState({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Inbox className="size-12 text-muted-foreground/50 mb-4" />
      <p className="text-sm text-muted-foreground">
        {text ?? "No items to display"}
      </p>
    </div>
  );
}

/**
 * SecondaryList Component
 */
export function SecondaryList({
  items,
  loading = false,
  error,
  emptyState,
  emptyText,
  renderUnknown = DefaultUnknownRenderer,
  onAction,
  slots,
  utils: customUtils,
  className,
  virtualize = false,
  loadingCount = 5,
}: SecondaryListProps) {
  // Merge custom utils with defaults
  const utils: RenderUtils = {
    ...defaultUtils,
    ...customUtils,
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-2", className)}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === "string" ? error : error.message;
    return (
      <div className={cn("flex-1 min-h-0 overflow-y-auto px-2 py-2", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={cn("flex-1 min-h-0 overflow-y-auto", className)}>
        {emptyState ?? <DefaultEmptyState text={emptyText} />}
      </div>
    );
  }

  // Render items
  return (
    <div
      role="listbox"
      className={cn("flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1", className)}
    >
      {items.map((item) => {
        const def = itemVariantRegistry.get(item.variantId);

        // Base context for all renderers
        const baseCtx: RenderCtx = {
          item: { ...item, params: item.params },
          onAction,
          slots,
          utils,
        };

        // Unknown variant - use fallback
        if (!def) {
          return (
            <div key={item.id} role="option">
              {renderUnknown(baseCtx)}
            </div>
          );
        }

        // Validate params with schema
        let parsedParams: any = {};
        try {
          parsedParams = def.paramsSchema.parse(item.params ?? {});
        } catch (e) {
          console.error(`[SecondaryList] Invalid params for variant ${String(def.id)}:`, e);
          return (
            <div key={item.id} role="option" className="px-3 py-2">
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-xs">
                  Invalid params for {String(def.id)}
                </AlertDescription>
              </Alert>
            </div>
          );
        }

        // Render with validated params
        return (
          <div key={item.id} role="option">
            {def.render({
              ...baseCtx,
              item: {
                ...baseCtx.item,
                params: parsedParams,
              },
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Export with display name for better debugging
 */
SecondaryList.displayName = "SecondaryList";
