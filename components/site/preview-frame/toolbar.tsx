"use client";

import * as React from "react";
import {
  ExternalLink,
  Maximize2,
  RefreshCw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PreviewOrientation, PreviewView } from "@/lib/preview-presets";
import { ViewButtonStrip, ViewDropdown } from "./view-picker";

export function PreviewToolbar({
  src,
  view,
  setView,
  zoom,
  setZoom,
  minZoom,
  maxZoom,
  orientation,
  canRotate,
  toggleOrientation,
  refreshIframe,
  setFullscreen,
  compact,
  viewControls,
}: {
  src: string;
  view: PreviewView;
  setView: (v: PreviewView) => void;
  zoom: number;
  setZoom: (v: number) => void;
  minZoom: number;
  maxZoom: number;
  orientation: PreviewOrientation;
  canRotate: boolean;
  toggleOrientation: () => void;
  refreshIframe: () => void;
  setFullscreen: (v: boolean) => void;
  compact: boolean;
  viewControls: "buttons" | "dropdown";
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
      {!compact && viewControls === "buttons" && <ViewButtonStrip view={view} setView={setView} />}
      {!compact && viewControls === "dropdown" && <ViewDropdown view={view} setView={setView} />}

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost" size="icon"
          className={cn("size-6", orientation === "landscape" && "bg-accent text-foreground")}
          onClick={toggleOrientation}
          disabled={!canRotate}
          aria-label="Rotate device"
          title={canRotate ? `Rotate (${orientation})` : "Rotation disabled"}
        >
          <RotateCw className={cn("size-3 transition-transform", orientation === "landscape" && "rotate-90")} />
        </Button>
        <Button variant="ghost" size="icon" className="size-6"
          onClick={() => setZoom(Math.max(minZoom, +(zoom - 0.1).toFixed(2)))}
          aria-label="Zoom out">
          <ZoomOut className="size-3" />
        </Button>
        <input type="range" min={minZoom * 100} max={maxZoom * 100} step={5}
          value={Math.round(zoom * 100)}
          onChange={(e) => setZoom(Number(e.target.value) / 100)}
          className="h-1 w-24 cursor-pointer accent-foreground" />
        <Button variant="ghost" size="icon" className="size-6"
          onClick={() => setZoom(Math.min(maxZoom, +(zoom + 0.1).toFixed(2)))}
          aria-label="Zoom in">
          <ZoomIn className="size-3" />
        </Button>
        <span className="w-9 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="size-6"
          onClick={() => refreshIframe()}
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
  );
}
