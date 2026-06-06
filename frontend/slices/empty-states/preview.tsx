"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { EmptyState } from "./components/EmptyState";
import type { EmptyStateKind } from "./components/presets";

const KINDS: EmptyStateKind[] = [
  "404",
  "500",
  "403",
  "no-results",
  "empty-list",
  "first-use",
];

const ACTIONS: Partial<
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
  EmptyState: ({ variant }) => {
    const scenario = (variant.scenario ?? "404") as EmptyStateKind;
    const kind = KINDS.includes(scenario) ? scenario : "404";
    const action = ACTIONS[kind];
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
