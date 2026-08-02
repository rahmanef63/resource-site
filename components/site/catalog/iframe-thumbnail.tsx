"use client";

// Catalog thumbnail = scaled-down sandboxed iframe.
// Composes the preview module — same iframe / lazy / loaded semantics
// as the dialog and detail-page surfaces.
//
// Two ways to call:
//
//   1. `source={normalizePreviewSource(entry)}`  (preferred — SSOT)
//   2. legacy direct props (src + liveTitle + liveDefault*)
//
// Both produce identical output; the source form is just terser when
// you already have a SliceEntry/LayoutEntry in hand.

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  PREVIEW_DEFAULTS,
  PreviewIframe,
  useIframeLazyLoad,
  useIframeLoaded,
  type PreviewSource,
} from "@/components/site/preview";
import type { PreviewView } from "@/lib/preview-presets";
import { LivePreviewButton } from "./live-preview-button";

type CommonProps = {
  className?: string;
  /** Scale factor (default = PREVIEW_DEFAULTS.thumbnailScale). */
  scale?: number;
  /** Aspect ratio override (Tailwind aspect-* fragment or CSS value). */
  aspect?: string;
  /** Custom IntersectionObserver rootMargin. */
  rootMargin?: string;
  /** Suppress the "Try it" overlay even when liveTitle/source.title is set. */
  hideLiveTrigger?: boolean;
};

type SourceProps = CommonProps & {
  source: PreviewSource;
  src?: never;
  liveTitle?: never;
  liveDefaultView?: never;
  liveDefaultZoom?: never;
};

type LegacyProps = CommonProps & {
  src: string;
  /** BR-wave — override URL for the LivePreviewButton dialog's
   *  "Open in new tab" link. Iframe still loads `src`. */
  externalUrl?: string;
  liveTitle?: string;
  liveDefaultView?: PreviewView;
  liveDefaultZoom?: number;
  source?: never;
};

type Props = SourceProps | LegacyProps;

function resolveSource(props: Props): {
  src: string;
  externalUrl?: string;
  liveTitle?: string;
  liveDefaultView?: PreviewView;
  liveDefaultZoom?: number;
} {
  if ("source" in props && props.source) {
    return {
      src: props.source.publicPath,
      externalUrl: props.source.publicExternalUrl,
      liveTitle: props.source.title,
      liveDefaultView: props.source.defaultView,
      liveDefaultZoom: props.source.defaultZoom,
    };
  }
  return {
    src: props.src,
    externalUrl: props.externalUrl,
    liveTitle: props.liveTitle,
    liveDefaultView: props.liveDefaultView,
    liveDefaultZoom: props.liveDefaultZoom,
  };
}

export function IframeThumbnail(props: Props) {
  const {
    className,
    scale = PREVIEW_DEFAULTS.thumbnailScale,
    aspect = PREVIEW_DEFAULTS.thumbnailAspect,
    rootMargin,
    hideLiveTrigger,
  } = props;
  const { src, externalUrl, liveTitle, liveDefaultView, liveDefaultZoom } = resolveSource(props);
  const { ref, visible } = useIframeLazyLoad<HTMLDivElement>(rootMargin);
  const { loaded, onLoad } = useIframeLoaded();
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden bg-muted/40",
        PREVIEW_DEFAULTS.containerRadius,
        PREVIEW_DEFAULTS.containerRing,
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
      {liveTitle && !hideLiveTrigger && (
        <LivePreviewButton
          src={src}
          externalUrl={externalUrl}
          title={liveTitle}
          defaultView={liveDefaultView}
          defaultZoom={liveDefaultZoom}
        />
      )}
    </div>
  );
}
