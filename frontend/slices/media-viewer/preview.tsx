"use client";

// audit-allow-hex: hex lives inside the inline SVG demo payload (data URI),
// not themable chrome.
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { MediaViewer } from "./index";

// Offline remote payload — configureMediaSource defaults to identity, so a
// data-URI path renders without any backend or network.
const REMOTE_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#7c3aed"/>
</linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>
<text x="400" y="320" fill="rgba(255,255,255,0.9)" font-family="monospace" font-size="34" text-anchor="middle">remote payload</text>
</svg>`,
)}`;

const SCENARIO_PAYLOAD: Record<
  string,
  { path: string; name: string; kind: string } | undefined
> = {
  "sample-gallery": undefined,
  "remote-image": { path: REMOTE_SVG, name: "remote.svg", kind: "image" },
};

const preview: SlicePreviewModule = {
  MediaViewer: ({ variant }) => {
    const scenario = variant.scenario ?? "sample-gallery";
    return (
      <div className="p-4">
        <div className="h-[360px] overflow-hidden rounded-lg border border-border">
          <MediaViewer key={scenario} payload={SCENARIO_PAYLOAD[scenario]} />
        </div>
      </div>
    );
  },
};

export default preview;
