"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PREVIEW_PRESETS,
  applyRotation,
  type PreviewOrientation,
  type PreviewPreset,
  type PreviewView,
} from "@/lib/preview-presets";
import { PaneViewSelector } from "./pane-view-selector";

export function SplitPane({
  src,
  externalUrl,
  label,
  hint,
  icon: Icon,
  tone,
  view,
  onViewChange,
  orientation = "portrait",
}: {
  src: string;
  /** BR-wave — override URL for the "Open in new tab" link. Iframe
   *  still loads `src` (same-origin so localStorage + BroadcastChannel
   *  sync between public/admin panes). New-tab opens this canonical
   *  demo URL (subdomain) for portfolio/share use. Falls back to
   *  `src` when not provided. */
  externalUrl?: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "violet";
  view: PreviewView;
  onViewChange: (view: PreviewView) => void;
  orientation?: PreviewOrientation;
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
    violet: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/15",
  };

  const preset: PreviewPreset = React.useMemo(
    () => applyRotation(PREVIEW_PRESETS[view], orientation),
    [view, orientation],
  );

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const sx = (w - 24) / preset.width;
      const sy = (h - 24) / preset.height;
      const s = Math.min(sx, sy, 1.2);
      setScale(Math.max(0.25, s));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [preset.width, preset.height]);

  const isDesktopFit = preset.width >= 1280;

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <Badge className={cn("rounded-full text-[10px]", tones[tone])}>
            <Icon className="mr-1 size-3" /> {label}
          </Badge>
          <span className="truncate text-[11px] text-muted-foreground">{hint}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <PaneViewSelector value={view} onChange={onViewChange} />
          <span className="hidden font-mono text-[10px] text-muted-foreground md:inline">
            {preset.width}×{preset.height} · {Math.round(scale * 100)}%
          </span>
          <a
            href={externalUrl ?? src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={`Open ${label} in new tab`}
            title={`Open ${label} in new tab`}
          >
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-auto bg-zinc-950/40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.zinc.700/.4)_1px,transparent_0)] [background-size:14px_14px]"
      >
        {isDesktopFit ? (
          <iframe
            src={src}
            title={`${label} preview`}
            loading="lazy"
            className="h-full w-full border-0 bg-background"
          />
        ) : (
          <div className="flex min-h-full justify-center p-3">
            <div
              className="relative shrink-0"
              style={{ width: preset.width * scale, height: preset.height * scale }}
            >
              <div
                style={{
                  width: preset.width,
                  height: preset.height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
                className="overflow-hidden rounded-md border bg-background shadow-2xl"
              >
                <iframe
                  src={src}
                  title={`${label} preview`}
                  loading="lazy"
                  className="h-full w-full border-0 bg-background"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SplitDivider({
  orientation,
  onPointerDown,
  active,
}: {
  orientation: "horizontal" | "vertical";
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  active?: boolean;
}) {
  const cursorCls = orientation === "horizontal" ? "cursor-col-resize" : "cursor-row-resize";
  const sizeCls =
    orientation === "horizontal"
      ? "w-2 hover:w-3 active:w-3"
      : "h-2 hover:h-3 active:h-3";
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      aria-label="Drag to resize panes"
      title="Drag to resize panes"
      className={cn(
        "group flex shrink-0 items-center justify-center bg-border/40 transition-all",
        cursorCls,
        sizeCls,
        active && "bg-emerald-500/40",
        orientation === "horizontal" ? "h-full" : "w-full",
      )}
    >
      <div
        className={cn(
          "rounded-full bg-zinc-500/60 transition-colors group-hover:bg-zinc-400 group-active:bg-emerald-400",
          orientation === "horizontal" ? "h-12 w-0.5" : "h-0.5 w-12",
        )}
      />
    </button>
  );
}
