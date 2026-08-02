"use client";

/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import { useMemo } from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import {
  QuicklinksApp,
  configureQuicklinks,
  createMemoryStore,
  DEFAULT_QUICKLINKS,
} from "./index";

// Both scenarios run on injected in-memory stores so the preview never
// touches the visitor's localStorage. Real hosts get persistence for free
// (default store) or inject their own via configureQuicklinks().

const preview: SlicePreviewModule = {
  QuicklinksApp: ({ variant }) => {
    const scenario = variant.scenario ?? "seeded-grid";
    useMemo(() => {
      configureQuicklinks(createMemoryStore(scenario === "empty" ? [] : DEFAULT_QUICKLINKS));
    }, [scenario]);
    return (
      <div className="p-4">
        <div className="h-[360px] overflow-hidden rounded-lg border border-border">
          <QuicklinksApp key={scenario} />
        </div>
      </div>
    );
  },
};

export default preview;
