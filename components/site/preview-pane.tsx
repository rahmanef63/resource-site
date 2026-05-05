"use client";

import * as React from "react";
import { selectionsToQuery, useFeatureContext } from "./feature-context";
import { PREVIEW_PRESETS, applyRotation, type PreviewPreset } from "@/lib/preview-presets";
import { cn } from "@/lib/utils";

export function PreviewPane({ src }: { src: string }) {
  const { previewView, previewOrientation, previewZoom, manifest, selections } = useFeatureContext();
  const [iframeKey, setIframeKey] = React.useState(0);

  React.useEffect(() => {
    function refresh() { setIframeKey((k) => k + 1); }
    window.addEventListener("rresource:refresh-preview", refresh);
    return () => window.removeEventListener("rresource:refresh-preview", refresh);
  }, []);

  const finalSrc = React.useMemo(() => {
    if (manifest?.composePreviewSrc) return manifest.composePreviewSrc(selections, src);
    const q = selectionsToQuery(selections);
    return q ? `${src}${q}` : src;
  }, [src, manifest, selections]);

  const basePreset = PREVIEW_PRESETS[previewView];
  const preset = applyRotation(basePreset, previewOrientation);
  const segmented = preset.mode === "segmented" && (preset.segments ?? 1) >= 2;

  const shellW = preset.width;
  const shellH = preset.height;
  const canvasW = Math.round(shellW * previewZoom);
  const canvasH = Math.round(shellH * previewZoom);

  return (
    <div className="relative h-full overflow-auto bg-zinc-950/40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.zinc.700/.4)_1px,transparent_0)] [background-size:14px_14px]">
      <div className="flex justify-center p-6">
        <div
          className="relative"
          style={{ width: canvasW, height: canvasH }}
          aria-label={`${preset.label} (${preset.width}×${preset.height})`}
        >
          <div
            style={{
              width: shellW,
              height: shellH,
              transform: `scale(${previewZoom})`,
              transformOrigin: "top left",
            }}
            className={cn(
              "relative overflow-hidden rounded-md border bg-background shadow-2xl",
              segmented && "ring-1 ring-zinc-700/40",
            )}
          >
            {segmented ? (
              <SegmentedIframe key={finalSrc + ":" + iframeKey} src={finalSrc} preset={preset} />
            ) : (
              <iframe
                key={finalSrc + ":" + iframeKey}
                src={finalSrc}
                title="Preview"
                loading="lazy"
                className="h-full w-full border-0 bg-background"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Single full-shell iframe; overlay hinge bars on top so layout inside stays
// continuous (responsive), only chrome shows hinge guides.
function SegmentedIframe({ src, preset }: { src: string; preset: PreviewPreset }) {
  const segments = preset.segments ?? 2;
  const hinge = preset.hinge ?? 24;
  const hingeIsVertical = preset.hingeAxis === "vertical"; // panels side-by-side

  return (
    <div className="relative h-full w-full bg-zinc-950">
      <iframe
        src={src}
        title="Segmented preview"
        loading="lazy"
        className="h-full w-full border-0 bg-background"
      />
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: segments - 1 }).map((_, i) => {
          const pct = ((i + 1) / segments) * 100;
          if (hingeIsVertical) {
            return (
              <div
                key={i}
                className="absolute inset-y-0 flex flex-col items-center justify-center"
                style={{
                  left: `calc(${pct}% - ${hinge / 2}px)`,
                  width: hinge,
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.85), rgba(0,0,0,0.55))",
                  boxShadow: "inset 1px 0 0 rgba(255,255,255,0.05), inset -1px 0 0 rgba(255,255,255,0.05)",
                }}
              >
                <div className="w-0.5 h-12 rounded-full bg-zinc-500/60" />
              </div>
            );
          }
          return (
            <div
              key={i}
              className="absolute inset-x-0 flex items-center justify-center"
              style={{
                top: `calc(${pct}% - ${hinge / 2}px)`,
                height: hinge,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.85), rgba(0,0,0,0.55))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div className="h-0.5 w-12 rounded-full bg-zinc-500/60" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
