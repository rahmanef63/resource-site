"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { ImageEditor } from "./image-editor";

const SCENARIOS: Record<string, { width: number; height: number }> = {
  square: { width: 640, height: 360 },
  wide: { width: 960, height: 360 },
};

const preview: SlicePreviewModule = {
  ImageEditor: ({ variant }) => {
    const scenario = variant.scenario ?? "square";
    const { width, height } = SCENARIOS[scenario] ?? SCENARIOS.square;
    // Konva stage is client-only (dynamic ssr:false inside ImageEditor) and
    // seeds a blank doc — no server/fs. Re-key so switching scenario remounts
    // with the new canvas size.
    return (
      <div className="p-4">
        <div className="h-[360px] overflow-hidden rounded-lg border bg-background">
          <ImageEditor key={scenario} width={width} height={height} className="h-full" />
        </div>
      </div>
    );
  },
};
export default preview;
