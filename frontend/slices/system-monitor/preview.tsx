"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import SystemMonitor from "./app";

const preview: SlicePreviewModule = {
  SystemMonitor: ({ variant }) => {
    const scenario = variant.scenario ?? "wide";
    return (
      <div className={scenario === "compact" ? "mx-auto h-[38rem] w-[26rem] max-w-full" : "h-[38rem] w-full"}>
        <SystemMonitor />
      </div>
    );
  },
};

export default preview;
