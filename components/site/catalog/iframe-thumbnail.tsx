"use client";

// Real preview iframe scaled down for catalog cards.
//
// - IntersectionObserver-gated: doesn't load until card scrolls into view.
//   Keeps initial route fast even with N iframes on screen.
// - Pointer-events: none on the iframe so card-level click-to-detail wins.
// - Transform-scale 0.4x → effective desktop preview at 1280×800 fitted into
//   ~512×320 visual cell. Fallback skeleton while loading.
//
// When `liveTitle` is set, a "Try it" trigger overlays the bottom-right
// (icon-picker-style affordance) and opens an interactive PreviewFrame
// in a Dialog — keeps the user on the catalog while still letting them
// click around the real slice/template.

import * as React from "react";
import type { PreviewView } from "@/lib/preview-presets";
import { cn } from "@/lib/utils";
import { LivePreviewButton } from "./live-preview-button";

export function IframeThumbnail({
  src,
  className,
  scale = 0.4,
  liveTitle,
  liveDefaultView,
  liveDefaultZoom,
}: {
  src: string;
  className?: string;
  scale?: number;
  /** When set, render an interactive "Try it" trigger over the thumbnail. */
  liveTitle?: string;
  liveDefaultView?: PreviewView;
  liveDefaultZoom?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden rounded-md bg-muted/40 ring-1 ring-border/40",
        className,
      )}
    >
      {/* Skeleton until iframe loaded */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40" />
      )}
      {visible && (
        <iframe
          src={src}
          loading="lazy"
          aria-hidden
          tabIndex={-1}
          // Defense-in-depth — preview routes are first-party but
          // sandbox blocks form submission, popups, top-nav escape.
          // allow-scripts + allow-same-origin needed for the preview to
          // render React/Next chrome and read its own bundle.
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          className="pointer-events-none absolute origin-top-left border-0"
          style={{
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
            transform: `scale(${scale})`,
          }}
        />
      )}
      {/* Scrim — dims the iframe for legibility + signals "preview" */}
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
