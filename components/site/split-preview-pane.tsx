"use client";

import * as React from "react";
import { ArrowLeftRight, Eye, LayoutDashboard, RefreshCw, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFeatureContext } from "./feature-context";
import {
  PREVIEW_PRESETS,
  applyRotation,
  type PreviewOrientation,
  type PreviewView,
} from "@/lib/preview-presets";
import { SplitDivider, SplitPane } from "./split-preview/split-pane";

type Props = {
  publicSrc: string;
  adminSrc: string;
  /** Force a preview view (e.g. "desktop"). Skips context. */
  view?: PreviewView;
  /** Force preview rotation. Skips context. */
  previewOrientation?: PreviewOrientation;
};

/** Safe context read — returns null when no FeatureProvider is mounted
 *  (e.g. when rendered inside /slices instead of /layouts). */
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
  previewOrientation: previewOrientationProp,
}: Props) {
  const ctx = useOptionalFeatureContext();
  const previewView = view ?? ctx?.previewView ?? "desktop";
  const previewOrientation = previewOrientationProp ?? ctx?.previewOrientation ?? "portrait";
  const [iframeKey, setIframeKey] = React.useState(0);
  const [splitOrientation, setSplitOrientation] =
    React.useState<"horizontal" | "vertical">("horizontal");

  React.useEffect(() => {
    function refresh() {
      setIframeKey((k) => k + 1);
    }
    window.addEventListener("rresource:refresh-preview", refresh);
    return () => window.removeEventListener("rresource:refresh-preview", refresh);
  }, []);

  const basePreset = PREVIEW_PRESETS[previewView];
  const preset = applyRotation(basePreset, previewOrientation);

  return (
    <div className="flex h-full flex-col bg-zinc-950/40">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/60 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeftRight className="size-3.5 shrink-0" />
          <span className="truncate">
            Live sync via BroadcastChannel — submit di Public, lihat di Admin (dan sebaliknya).
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
            {preset.label} · {preset.width}×{preset.height}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSplitOrientation((o) => (o === "horizontal" ? "vertical" : "horizontal"))}
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
        className={cn(
          "flex flex-1 overflow-hidden",
          splitOrientation === "horizontal" ? "flex-row" : "flex-col",
        )}
      >
        <SplitPane
          key={"pub-" + iframeKey}
          src={publicSrc}
          label="Public"
          hint="visitor view"
          icon={Eye}
          tone="emerald"
          preset={preset}
        />
        <SplitDivider orientation={splitOrientation} />
        <SplitPane
          key={"adm-" + iframeKey}
          src={adminSrc}
          label="Admin"
          hint="owner dashboard"
          icon={LayoutDashboard}
          tone="violet"
          preset={preset}
        />
      </div>
    </div>
  );
}
