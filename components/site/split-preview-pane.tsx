"use client";

import * as React from "react";
import { ArrowLeftRight, Eye, LayoutDashboard, RefreshCw, Rows3, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFeatureContext } from "./feature-context";
import type { PreviewView } from "@/lib/preview-presets";
import { SplitDivider, SplitPane } from "./split-preview/split-pane";
import { useSplitRatio } from "./split-preview/use-split-ratio";

type Props = {
  publicSrc: string;
  adminSrc: string;
  /** BR-wave — optional canonical demo URLs for "Open in new tab".
   *  When set, the per-pane new-tab link points here (e.g. subdomain
   *  https://demo-konsultan.rahmanef.com/ + /admin). The iframe still
   *  loads publicSrc/adminSrc internally so localStorage sync between
   *  panes keeps working (same origin = same storage scope). */
  publicExternalUrl?: string;
  adminExternalUrl?: string;
  /** Seed view for both panes. Re-syncs both panes when this changes
   *  (lets the page-level main viewport selector drive both at once).
   *  Each pane can still diverge via its own selector after. */
  view?: PreviewView;
  /** Storage key for the divider ratio. Pass a slug-derived key so each
   *  slice / template remembers its own preferred split. */
  storageKey?: string;
};

function useOptionalFeatureContext(): ReturnType<typeof useFeatureContext> | null {
  try {
    return useFeatureContext();
  } catch {
    return null;
  }
}

export function SplitPreviewPane({
  publicSrc,
  adminSrc,
  publicExternalUrl,
  adminExternalUrl,
  view,
  storageKey,
}: Props) {
  const ctx = useOptionalFeatureContext();
  const seedView = view ?? ctx?.previewView ?? "desktop";

  const [publicView, setPublicView] = React.useState<PreviewView>(seedView);
  const [adminView, setAdminView] = React.useState<PreviewView>(seedView);
  const [iframeKey, setIframeKey] = React.useState(0);
  const [splitOrientation, setSplitOrientation] =
    React.useState<"horizontal" | "vertical">("horizontal");

  // Page-level viewport (main selector) drives BOTH panes whenever it
  // changes. Per-pane selectors then let the user diverge from there.
  React.useEffect(() => {
    setPublicView(seedView);
    setAdminView(seedView);
  }, [seedView]);

  const {
    ratio,
    containerStyle,
    leftPaneStyle,
    onDragStart,
    dragging,
    resetRatio,
  } = useSplitRatio({
    storageKey: storageKey ? `rr.split-ratio:${storageKey}` : undefined,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function refresh() {
      setIframeKey((k) => k + 1);
    }
    window.addEventListener("rresource:refresh-preview", refresh);
    return () => window.removeEventListener("rresource:refresh-preview", refresh);
  }, []);

  return (
    <div className="flex h-full flex-col bg-zinc-950/40">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/60 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeftRight className="size-3.5 shrink-0" />
          <span className="truncate">
            Drag the divider to resize · swap viewport per pane independently.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
            split {Math.round(ratio * 100)}/{Math.round((1 - ratio) * 100)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={resetRatio}
            aria-label="Reset split to 50/50"
            title="Reset split 50/50"
          >
            <Maximize2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() =>
              setSplitOrientation((o) => (o === "horizontal" ? "vertical" : "horizontal"))
            }
            aria-label="Toggle split orientation"
            title={splitOrientation === "horizontal" ? "Stack vertically" : "Side-by-side"}
          >
            <Rows3
              className={cn(
                "size-3.5 transition-transform",
                splitOrientation === "vertical" && "rotate-90",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setIframeKey((k) => k + 1)}
            aria-label="Refresh both"
            title="Refresh"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={containerStyle}
        className={cn(
          "flex flex-1 overflow-hidden",
          splitOrientation === "horizontal" ? "flex-row" : "flex-col",
          dragging && "select-none [&_iframe]:pointer-events-none",
        )}
      >
        <div className="flex min-w-0 min-h-0 flex-col" style={leftPaneStyle}>
          <SplitPane
            key={"pub-" + iframeKey}
            src={publicSrc}
            externalUrl={publicExternalUrl}
            label="Public"
            hint="visitor view"
            icon={Eye}
            tone="emerald"
            view={publicView}
            onViewChange={setPublicView}
          />
        </div>
        <SplitDivider
          orientation={splitOrientation}
          onPointerDown={(e) => onDragStart(e, containerRef.current, splitOrientation)}
          active={dragging}
        />
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <SplitPane
            key={"adm-" + iframeKey}
            src={adminSrc}
            externalUrl={adminExternalUrl}
            label="Admin"
            hint="owner dashboard"
            icon={LayoutDashboard}
            tone="violet"
            view={adminView}
            onViewChange={setAdminView}
          />
        </div>
      </div>
    </div>
  );
}
