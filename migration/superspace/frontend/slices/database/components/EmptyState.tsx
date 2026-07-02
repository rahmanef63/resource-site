/**
 * EmptyState Component — slice-local database empty state.
 *
 * @dod:dup-eliminate Shared `EmptyState` (frontend/shared/ui/dashboard/EmptyState)
 * is a centered py-12 block used in dashboards. This component is a full-flex
 * `h-full flex-1` empty state used inside `DatabaseShell` (storefront layout) —
 * it fills the available view area and shows a "Databases" category pill on top.
 * Different layout contract → keep slice-local.
 */

import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase text-muted-foreground">
        Databases
      </div>
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          )}
        >
          {actionLabel}
        </button>
      ) : null}
      {children ? <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
