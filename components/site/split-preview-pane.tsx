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
  /** Force a starting view for BOTH panes (e.g. "desktop"). Each pane then
   *  diverges independently via its own selector. Defaults to context or
   *  "desktop". */
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

  const { ratio, resetRatio, onDragStart, dragging } = useSplitRatio({
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

  const leftStyle =
    splitOrientation === "horizontal"
      ? ({ flex: `0 0 ${ratio * 100}%` } as const)
      : ({ flex: `0 0 ${ratio * 100}%` } as const);

  return (
    <div className="flex h-full flex-col bg-zinc-950/40">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/60 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeftRight className="size-3.5 shrink-0" />
          <span className="truncate">
            Live sync via BroadcastChannel — drag divider to resize, swap viewport per pane.
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
        className={cn(
          "flex flex-1 overflow-hidden",
          splitOrientation === "horizontal" ? "flex-row" : "flex-col",
          dragging && "select-none",
        )}
      >
        <div className="flex min-w-0 min-h-0 flex-col" style={leftStyle}>
          <SplitPane
            key={"pub-" + iframeKey}
            src={publicSrc}
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
