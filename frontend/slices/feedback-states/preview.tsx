"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { LoadingSkeleton } from "./variants/loading/components/LoadingSkeleton";
import { LoadingState } from "./variants/loading/components/LoadingState";
import { LOADING_KINDS, type LoadingKind } from "./variants/loading/components/presets";
import { EmptyState } from "./variants/empty/components/EmptyState";
import type { EmptyStateKind } from "./variants/empty/components/presets";

const STATE_VARIANTS = ["inline", "block", "overlay"] as const;
type StateVariant = (typeof STATE_VARIANTS)[number];

const EMPTY_KINDS: EmptyStateKind[] = [
  "404",
  "500",
  "403",
  "no-results",
  "empty-list",
  "first-use",
];

const EMPTY_ACTIONS: Partial<
  Record<EmptyStateKind, { label: string; secondary?: string }>
> = {
  "404": { label: "Back home", secondary: "Contact support" },
  "500": { label: "Try again" },
  "403": { label: "Request access", secondary: "Back home" },
  "no-results": { label: "Clear filters" },
  "empty-list": { label: "Create item" },
  "first-use": { label: "Get started", secondary: "Learn more" },
};

const preview: SlicePreviewModule = {
  LoadingSkeleton: ({ variant }) => {
    const scenario = (variant.scenario ?? "text") as LoadingKind;
    const kind = LOADING_KINDS.includes(scenario) ? scenario : "text";
    return (
      <div className="p-6">
        <LoadingSkeleton kind={kind} />
      </div>
    );
  },
  LoadingState: ({ variant }) => {
    const scenario = (variant.scenario ?? "block") as StateVariant;
    const v = STATE_VARIANTS.includes(scenario) ? scenario : "block";
    if (v === "overlay") {
      return (
        <div className="relative m-6 rounded-lg border p-6">
          <LoadingSkeleton kind="text" />
          <LoadingState variant="overlay" label="Saving…" />
        </div>
      );
    }
    if (v === "inline") {
      return (
        <p className="p-6 text-sm">
          Sync status: <LoadingState variant="inline" label="Refreshing…" />
        </p>
      );
    }
    return <LoadingState variant="block" label="Loading workspace…" />;
  },
  EmptyState: ({ variant }) => {
    const scenario = (variant.scenario ?? "404") as EmptyStateKind;
    const kind = EMPTY_KINDS.includes(scenario) ? scenario : "404";
    const action = EMPTY_ACTIONS[kind];
    return (
      <div className="p-4">
        <EmptyState
          kind={kind}
          primaryAction={action ? { label: action.label } : undefined}
          secondaryAction={
            action?.secondary ? { label: action.secondary } : undefined
          }
        />
      </div>
    );
  },
};

export default preview;
