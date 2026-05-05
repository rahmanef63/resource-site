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
import { cn } from "@/lib/utils";
import {
  PREVIEW_PRESETS,
  PREVIEW_VIEW_ORDER,
  applyRotation,
  type PreviewOrientation,
  type PreviewPreset,
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
};

export function PreviewFrame({
  src,
  defaultView = "desktop",
  defaultZoom,
  minZoom = 0.4,
  maxZoom = 1.5,
  className,
  compact = false,
}: Props) {
  const [view, setView] = React.useState<PreviewView>(defaultView);
  const [orientation, setOrientation] = React.useState<PreviewOrientation>("portrait");
  const [zoom, setZoom] = React.useState<number>(defaultZoom ?? (compact ? 1 : 0.6));
  const [iframeKey, setIframeKey] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);

  const basePreset = PREVIEW_PRESETS[view];
  const preset = applyRotation(basePreset, orientation);
  const segmented = preset.mode === "segmented" && (preset.segments ?? 1) >= 2;
  const canRotate = basePreset.canRotate !== false;
  const canvasH = Math.round(preset.height * zoom) + 56;

  return (
    <>
      <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
          {!compact && (
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

        <div className="relative overflow-auto bg-zinc-950/40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.zinc.700/.4)_1px,transparent_0)] [background-size:14px_14px]"
             style={{ height: canvasH }}>
          <div className="flex justify-center p-6">
            <div className="relative" style={{ width: preset.width * zoom, height: preset.height * zoom }}>
              <div
                style={{ width: preset.width, height: preset.height, transform: `scale(${zoom})`, transformOrigin: "top left" }}
                className={cn("relative overflow-hidden rounded-md border bg-background shadow-2xl", segmented && "ring-1 ring-zinc-700/40")}
              >
                {segmented ? (
                  <SegmentedFrame key={iframeKey} src={src} preset={preset} />
                ) : (
                  <iframe key={iframeKey} src={src} title="Preview" loading="lazy" className="h-full w-full border-0 bg-background" />
                )}
              </div>
            </div>
          </div>
        </div>
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

function SegmentedFrame({ src, preset }: { src: string; preset: PreviewPreset }) {
  const segments = preset.segments ?? 2;
  const hinge = preset.hinge ?? 24;
  const hingeIsVertical = preset.hingeAxis === "vertical";
  return (
    <div className="relative h-full w-full bg-zinc-950">
      <iframe src={src} title="Segmented" loading="lazy" className="h-full w-full border-0 bg-background" />
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: segments - 1 }).map((_, i) => {
          const pct = ((i + 1) / segments) * 100;
          return hingeIsVertical ? (
            <div key={i} className="absolute inset-y-0 flex flex-col items-center justify-center"
              style={{ left: `calc(${pct}% - ${hinge / 2}px)`, width: hinge, background: "linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.85), rgba(0,0,0,0.55))" }}>
              <div className="w-0.5 h-12 rounded-full bg-zinc-500/60" />
            </div>
          ) : (
            <div key={i} className="absolute inset-x-0 flex items-center justify-center"
              style={{ top: `calc(${pct}% - ${hinge / 2}px)`, height: hinge, background: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.85), rgba(0,0,0,0.55))" }}>
              <div className="h-0.5 w-12 rounded-full bg-zinc-500/60" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
