"use client";

// Catalog thumbnail = scaled-down sandboxed iframe.
// Composes the preview module — same iframe / lazy / loaded semantics
// as the dialog and detail-page surfaces.
//
// IntersectionObserver gating (useIframeLazyLoad), onLoad skeleton swap
// (useIframeLoaded), and sandbox tokens (IFRAME_SANDBOX) all live in
// `@/components/site/preview` now — DRY across every preview context.
//
// "Try it" button overlay → opens an interactive PreviewFrame in a
// Dialog. Set `liveTitle` to enable it. Backward compat preserved.

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  PREVIEW_DEFAULTS,
  PreviewIframe,
  useIframeLazyLoad,
  useIframeLoaded,
} from "@/components/site/preview";
import type { PreviewView } from "@/lib/preview-presets";
import { LivePreviewButton } from "./live-preview-button";

type Props = {
  src: string;
  className?: string;
  /** Scale factor (default = PREVIEW_DEFAULTS.thumbnailScale). */
  scale?: number;
  /** Aspect ratio override (Tailwind aspect-* fragment). */
  aspect?: string;
  /** When set, an interactive "Try it" trigger overlays the thumbnail. */
  liveTitle?: string;
  liveDefaultView?: PreviewView;
  liveDefaultZoom?: number;
  /** Custom IntersectionObserver rootMargin. */
  rootMargin?: string;
};

export function IframeThumbnail({
  src,
  className,
  scale = PREVIEW_DEFAULTS.thumbnailScale,
  aspect = PREVIEW_DEFAULTS.thumbnailAspect,
  liveTitle,
  liveDefaultView,
  liveDefaultZoom,
  rootMargin,
}: Props) {
  const { ref, visible } = useIframeLazyLoad<HTMLDivElement>(rootMargin);
  const { loaded, onLoad } = useIframeLoaded();
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-md bg-muted/40 ring-1 ring-border/40",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40" />
      )}
      {visible && (
        <PreviewIframe
          src={src}
          pointerEventsNone
          onLoad={onLoad}
          className="absolute origin-top-left"
          style={{
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
            transform: `scale(${scale})`,
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
      {liveTitle && (
        <LivePreviewButton
          src={src}
          title={liveTitle}
          defaultView={liveDefaultView}
          defaultZoom={liveDefaultZoom}
        />
      )}
    </div>
  );
}
