"use client";

import * as React from "react";
import {
  Columns2,
  Columns3,
  ExternalLink,
  Maximize2,
  Monitor,
  RectangleHorizontal,
  RectangleVertical,
  RefreshCw,
  RotateCw,
  Smartphone,
  Sparkles,
  Square,
  Tablet,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PreviewIframeShell } from "@/components/site/preview-shell";
import {
  PREVIEW_PRESETS,
  PREVIEW_VIEW_ORDER,
  applyRotation,
  type PreviewOrientation,
  type PreviewView,
} from "@/lib/preview-presets";

const VIEW_ICONS: Record<PreviewView, React.ComponentType<{ className?: string }>> = {
  mobile: Smartphone,
  "mobile-flip": RectangleHorizontal,
  "fold-cover": RectangleVertical,
  "fold-open": Square,
  "tri-fold-single": Smartphone,
  "tri-fold-dual": Columns2,
  "tri-fold-triple": Columns3,
  tablet: Tablet,
  desktop: Monitor,
  "iphone-fold-rumor": Sparkles,
};

type Props = {
  src: string;
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
  defaultView = "desktop",
  defaultZoom,
  minZoom = 0.4,
  maxZoom = 1.5,
  className,
  compact = false,
  viewControls = "buttons",
}: Props) {
  const [view, setView] = React.useState<PreviewView>(defaultView);
  const [orientation, setOrientation] = React.useState<PreviewOrientation>("portrait");
  const [zoom, setZoom] = React.useState<number>(defaultZoom ?? (compact ? 1 : 0.6));
  const [iframeKey, setIframeKey] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);

  const basePreset = PREVIEW_PRESETS[view];
  const preset = applyRotation(basePreset, orientation);
  const canRotate = basePreset.canRotate !== false;
  const canvasH = Math.round(preset.height * zoom) + 56;

  return (
    <>
      <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
          {!compact && viewControls === "buttons" && (
            <div className="flex items-center gap-0.5 rounded-md border bg-background p-0.5">
              {PREVIEW_VIEW_ORDER.map((k) => {
                const Icon = VIEW_ICONS[k];
                const p = PREVIEW_PRESETS[k];
                const on = view === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setView(k)}
                    className={cn(
                      "inline-flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors",
                      on ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                    title={`${p.label} (${p.width}×${p.height})${p.description ? " — " + p.description : ""}`}
                  >
                    <Icon className="size-3" />
                    <span className="hidden md:inline">{p.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {!compact && viewControls === "dropdown" && (
            <Select value={view} onValueChange={(v) => setView(v as PreviewView)}>
              <SelectTrigger className="h-7 w-[170px] gap-1.5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREVIEW_VIEW_ORDER.map((k) => {
                  const Icon = VIEW_ICONS[k];
                  const p = PREVIEW_PRESETS[k];
                  return (
                    <SelectItem key={k} value={k} className="text-xs">
                      <div className="flex w-full items-center gap-2">
                        <Icon className="size-3.5 text-muted-foreground" />
                        <span>{p.label}</span>
                        <span className="ml-auto pl-3 font-mono text-[10px] text-muted-foreground">
                          {p.width}×{p.height}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost" size="icon"
              className={cn("size-6", orientation === "landscape" && "bg-accent text-foreground")}
              onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))}
              disabled={!canRotate}
              aria-label="Rotate device"
              title={canRotate ? `Rotate (${orientation})` : "Rotation disabled"}
            >
              <RotateCw className={cn("size-3 transition-transform", orientation === "landscape" && "rotate-90")} />
            </Button>
            <Button variant="ghost" size="icon" className="size-6"
              onClick={() => setZoom((z) => Math.max(minZoom, +(z - 0.1).toFixed(2)))}
              aria-label="Zoom out">
              <ZoomOut className="size-3" />
            </Button>
            <input type="range" min={minZoom * 100} max={maxZoom * 100} step={5}
              value={Math.round(zoom * 100)}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
              className="h-1 w-24 cursor-pointer accent-foreground" />
            <Button variant="ghost" size="icon" className="size-6"
              onClick={() => setZoom((z) => Math.min(maxZoom, +(z + 0.1).toFixed(2)))}
              aria-label="Zoom in">
              <ZoomIn className="size-3" />
            </Button>
            <span className="w-9 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-6"
              onClick={() => setIframeKey((k) => k + 1)}
              aria-label="Refresh" title="Refresh">
              <RefreshCw className="size-3" />
            </Button>
            <Button variant="ghost" size="icon" className="size-6"
              onClick={() => setFullscreen(true)}
              aria-label="Fullscreen" title="Fullscreen">
              <Maximize2 className="size-3" />
            </Button>
            <a href={src} target="_blank" rel="noopener noreferrer"
              className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Open in new tab" title="Open in new tab">
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

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
