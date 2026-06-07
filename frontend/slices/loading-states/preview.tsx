"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { LoadingState } from "./components/LoadingState";
import { LOADING_KINDS, type LoadingKind } from "./components/presets";

const VARIANTS = ["inline", "block", "overlay"] as const;
type Variant = (typeof VARIANTS)[number];

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
    const scenario = (variant.scenario ?? "block") as Variant;
    const v = VARIANTS.includes(scenario) ? scenario : "block";
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
};

export default preview;
