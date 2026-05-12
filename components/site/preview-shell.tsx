"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { type PreviewPreset } from "@/lib/preview-presets";

type Props = {
  src: string;
  preset: PreviewPreset;
  zoom: number;
  /** Bump to force iframe remount. */
  iframeKey?: number | string;
  /** Outer scroll viewport class. */
  className?: string;
  /** Outer scroll viewport inline style — caller controls height (`h-full` vs fixed px). */
  style?: React.CSSProperties;
  /** Padding around the device shell. Default 24px. */
  padding?: number;
  /** Iframe loading mode. Default "lazy". */
  lazy?: boolean;
  /** Iframe `title` attribute. */
  title?: string;
};

/**
 * Pure renderer: device-sized iframe with zoom + segmented hinge overlay.
 * No chrome, no state. Consumers (PreviewFrame / PreviewPane) supply
 * `{ src, preset, zoom }` from their own state source and own the chrome.
 *
 * Single home for SegmentedFrame — used to be duplicated in
 * preview-frame.tsx and preview-pane.tsx.
 */
export function PreviewIframeShell({
  src,
  preset,
  zoom,
  iframeKey,
  className,
  style,
  padding = 24,
  lazy = true,
  title = "Preview",
}: Props) {
  const segmented = preset.mode === "segmented" && (preset.segments ?? 1) >= 2;
  return (
    <div
      className={cn(
        "relative overflow-auto bg-zinc-950/40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.zinc.700/.4)_1px,transparent_0)] [background-size:14px_14px]",
        className,
      )}
      style={style}
    >
      <div className="flex justify-center" style={{ padding }}>
        <div
          className="relative"
          style={{ width: preset.width * zoom, height: preset.height * zoom }}
          aria-label={`${preset.label} (${preset.width}×${preset.height})`}
        >
          <div
            style={{
              width: preset.width,
              height: preset.height,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
            className={cn(
              "relative overflow-hidden rounded-md border bg-background shadow-2xl",
              segmented && "ring-1 ring-zinc-700/40",
            )}
          >
            {segmented ? (
              <SegmentedFrame key={iframeKey} src={src} preset={preset} lazy={lazy} title={title} />
            ) : (
              <iframe
                key={iframeKey}
                src={src}
                title={title}
                loading={lazy ? "lazy" : undefined}
                className="h-full w-full border-0 bg-background"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SegmentedFrame({
  src,
  preset,
  lazy,
  title,
}: {
  src: string;
  preset: PreviewPreset;
  lazy?: boolean;
  title: string;
}) {
  const segments = preset.segments ?? 2;
  const hinge = preset.hinge ?? 24;
  const hingeIsVertical = preset.hingeAxis === "vertical";
  return (
    <div className="relative h-full w-full bg-zinc-950">
      <iframe
        src={src}
        title={title}
        loading={lazy ? "lazy" : undefined}
        className="h-full w-full border-0 bg-background"
      />
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: segments - 1 }).map((_, i) => {
          const pct = ((i + 1) / segments) * 100;
          return hingeIsVertical ? (
            <div
              key={i}
              className="absolute inset-y-0 flex flex-col items-center justify-center"
              style={{
                left: `calc(${pct}% - ${hinge / 2}px)`,
                width: hinge,
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.85), rgba(0,0,0,0.55))",
                boxShadow:
                  "inset 1px 0 0 rgba(255,255,255,0.05), inset -1px 0 0 rgba(255,255,255,0.05)",
              }}
            >
              <div className="h-12 w-0.5 rounded-full bg-zinc-500/60" />
            </div>
          ) : (
            <div
              key={i}
              className="absolute inset-x-0 flex items-center justify-center"
              style={{
                top: `calc(${pct}% - ${hinge / 2}px)`,
                height: hinge,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.85), rgba(0,0,0,0.55))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(255,255,255,0.05)",
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
