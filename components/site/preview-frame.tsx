"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PreviewIframeShell } from "@/components/site/preview-shell";
import { PREVIEW_DEFAULTS, usePreviewState } from "@/components/site/preview";
import {
  PREVIEW_PRESETS,
  applyRotation,
  type PreviewView,
} from "@/lib/preview-presets";
import { PreviewToolbar } from "@/components/site/preview-frame/toolbar";

type Props = {
  src: string;
  /** BR-wave — override URL for the "Open in new tab" link in the
   *  toolbar. Iframe still loads `src` (so internal /preview path
   *  preserves same-origin localStorage). When caller sets this to a
   *  demo subdomain, the new-tab opens the canonical portfolio URL. */
  externalUrl?: string;
  defaultView?: PreviewView;
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  compact?: boolean;
  /**
   * Render style for the responsive view picker.
   * - "buttons" (default): inline icon-button strip.
   * - "dropdown": single Select — matches the canvas pattern at /layouts/[slug].
   */
  viewControls?: "buttons" | "dropdown";
};

export function PreviewFrame({
  src,
  externalUrl,
  defaultView = "desktop",
  defaultZoom,
  minZoom = 0.4,
  maxZoom = 1.5,
  className,
  compact = false,
  viewControls = "buttons",
}: Props) {
  const {
    view, zoom, orientation, iframeKey, fullscreen,
    setView, setZoom, toggleOrientation, refreshIframe, setFullscreen,
  } = usePreviewState({
    defaultView,
    defaultZoom: defaultZoom ?? (compact ? 1 : 0.6),
  });

  const basePreset = PREVIEW_PRESETS[view];
  const preset = applyRotation(basePreset, orientation);
  const canRotate = basePreset.canRotate !== false;
  const canvasH = Math.round(preset.height * zoom) + 56;

  return (
    <>
      <div
        className={cn(
          "overflow-hidden border bg-card",
          PREVIEW_DEFAULTS.containerRadius,
          PREVIEW_DEFAULTS.containerShadow,
          PREVIEW_DEFAULTS.containerRing,
          className,
        )}
      >
        <PreviewToolbar
          src={src}
          externalUrl={externalUrl}
          view={view}
          setView={setView}
          zoom={zoom}
          setZoom={setZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          orientation={orientation}
          canRotate={canRotate}
          toggleOrientation={toggleOrientation}
          refreshIframe={refreshIframe}
          setFullscreen={setFullscreen}
          compact={compact}
          viewControls={viewControls}
        />

        <PreviewIframeShell
          src={src}
          preset={preset}
          zoom={zoom}
          iframeKey={iframeKey}
          style={{ height: canvasH }}
        />
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <p className="text-sm font-medium">{preset.label} · {orientation} · {Math.round(zoom * 100)}%</p>
            <Button variant="ghost" size="icon" onClick={() => setFullscreen(false)} aria-label="Close">
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden bg-muted/20">
            <iframe key={iframeKey + 1000} src={src} title="Preview fullscreen" className="h-full w-full border-0 bg-background" />
          </div>
        </div>
      )}
    </>
  );
}
