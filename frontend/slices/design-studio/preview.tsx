"use client";

// audit-allow-hex: hex lives inside the DEMO DOC payload (layer fills/tints —
// canvas content), not themable chrome.
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { MediaStudio } from "./index";
import { SAMPLE_IMAGES } from "./lib/samples";

// A 9:16 "story" doc in the os-rr/layers@1 shape — loaded through the same
// payload path a host shell would use. Fully offline (data-URI image).
const STORY_DOC = JSON.stringify({
  format: "os-rr/layers@1",
  canvas: { aspect: "9 / 16" },
  adjustments: { brightness: 104, contrast: 108, saturate: 124, hue: 0, blur: 0, sepia: 8, grayscale: 0 },
  layers: [
    { id: "d1", name: "CTA", kind: "text", z: 4, visible: true, opacity: 100,
      transform: { x: 0, y: 30, scale: 90, rotate: 0 }, text: "Link in bio ↑", color: "#ffffff" },
    { id: "d2", name: "Sticker", kind: "sticker", z: 3, visible: true, opacity: 100,
      transform: { x: 26, y: -26, scale: 130, rotate: 12 }, emoji: "🔥" },
    { id: "d3", name: "Portrait", kind: "image", z: 2, visible: true, opacity: 100,
      transform: { x: 0, y: -4, scale: 110, rotate: -3 }, src: SAMPLE_IMAGES[1], clip: "circle(50%)" },
    { id: "d4", name: "Background", kind: "image", z: 1, visible: true, opacity: 100,
      transform: { x: 0, y: 0, scale: 170, rotate: 0 },
      tint: "linear-gradient(135deg,#ff9a6b 0%,#ff6a9b 38%,#9b5cff 72%,#3aa0ff 100%)" },
  ],
});

const SCENARIO_PAYLOAD: Record<string, { doc: string } | undefined> = {
  "blank-canvas": undefined,
  "social-story": { doc: STORY_DOC },
};

const preview: SlicePreviewModule = {
  MediaStudio: ({ variant }) => {
    const scenario = variant.scenario ?? "blank-canvas";
    return (
      <div className="p-4">
        <div className="h-[480px] overflow-hidden rounded-lg border border-border">
          <MediaStudio key={scenario} payload={SCENARIO_PAYLOAD[scenario]} />
        </div>
      </div>
    );
  },
};

export default preview;
