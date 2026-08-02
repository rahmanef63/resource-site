"use client";

import * as React from "react";
import {
  Columns2,
  Columns3,
  Monitor,
  RectangleHorizontal,
  RectangleVertical,
  RefreshCw,
  RotateCw,
  Smartphone,
  Sparkles,
  Square,
  Tablet,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFeatureContext } from "./feature-context";
import { FeatureBarOpenButton } from "./feature-bar-open-button";
import { PREVIEW_PRESETS, type PreviewView } from "@/lib/preview-presets";

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

// Group presets for the dropdown.
const VIEW_GROUPS: { label: string; views: PreviewView[] }[] = [
  { label: "Mobile",   views: ["mobile", "mobile-flip", "fold-cover", "tri-fold-single"] },
  { label: "Tablet",   views: ["tablet", "fold-open", "tri-fold-dual"] },
  { label: "Desktop",  views: ["desktop", "tri-fold-triple"] },
  { label: "Experimental", views: ["iphone-fold-rumor"] },
];

const PREVIEW_TAB_IDS = new Set(["preview", "preview-public", "preview-admin", "preview-split"]);

export function FeatureBar() {
  const {
    manifest,
    activeTab,
    setActiveTab,
    previewView,
    setPreviewView,
    previewOrientation,
    togglePreviewOrientation,
    previewZoom,
    setPreviewZoom,
  } = useFeatureContext();

  if (!manifest) return null;
  const tabs = manifest.tabs ?? [];
  const showResponsive = !!manifest.responsive && !!activeTab && PREVIEW_TAB_IDS.has(activeTab);
  const isSplit = activeTab === "preview-split";
  const currentPreset = PREVIEW_PRESETS[previewView];
  const canRotate = currentPreset.canRotate !== false;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-1.5">
      <div className="flex items-center gap-0.5 rounded-md border bg-background p-0.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const on = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "inline-flex h-6 items-center gap-1.5 rounded px-2.5 text-[11px] font-medium transition-colors",
                on
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {Icon && <Icon className="size-3" />}
              {t.label}
            </button>
          );
        })}
      </div>

      {showResponsive && (
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={previewView}
            onValueChange={(v) => setPreviewView(v as PreviewView)}
          >
            <SelectTrigger className="h-7 w-[200px] gap-1.5 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_GROUPS.map((g, gi) => (
                <React.Fragment key={g.label}>
                  {gi > 0 && <div className="my-1 border-t border-border/50" />}
                  <div className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.label}
                  </div>
                  {g.views.map((k) => {
                    const Icon = VIEW_ICONS[k];
                    const p = PREVIEW_PRESETS[k];
                    return (
                      <SelectItem key={k} value={k} className="text-xs">
                        <div className="flex w-full items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span>{p.label}</span>
                          <span className="ml-auto pl-3 font-mono text-[10px] text-muted-foreground">
                            {p.width}×{p.height}
                          </span>
                          {p.experimental && (
                            <span className="rounded bg-amber-500/15 px-1 text-[9px] uppercase text-amber-300">
                              exp
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost" size="icon"
            className={cn("size-6", previewOrientation === "landscape" && "bg-accent text-foreground")}
            onClick={togglePreviewOrientation}
            disabled={!canRotate}
            aria-label="Rotate device"
            aria-pressed={previewOrientation === "landscape"}
            title={canRotate ? `Rotate (${previewOrientation})` : "Rotation disabled for this preset"}
          >
            <RotateCw className={cn("size-3 transition-transform", previewOrientation === "landscape" && "rotate-90")} />
          </Button>

          {!isSplit && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon" className="size-6"
                onClick={() => setPreviewZoom(Math.max(0.4, +(previewZoom - 0.1).toFixed(2)))}
                aria-label="Zoom out"
              >
                <ZoomOut className="size-3" />
              </Button>
              <input
                type="range" min={40} max={150} step={5}
                value={Math.round(previewZoom * 100)}
                onChange={(e) => setPreviewZoom(Number(e.target.value) / 100)}
                className="h-1 w-20 cursor-pointer accent-foreground"
              />
              <Button
                variant="ghost" size="icon" className="size-6"
                onClick={() => setPreviewZoom(Math.min(1.5, +(previewZoom + 0.1).toFixed(2)))}
                aria-label="Zoom in"
              >
                <ZoomIn className="size-3" />
              </Button>
              <span className="w-9 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                {Math.round(previewZoom * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1">
        <FeatureBarOpenButton activeTab={activeTab} manifest={manifest} />
        <Button
          variant="ghost" size="icon" className="size-6"
          onClick={() => window.dispatchEvent(new Event("rresource:refresh-preview"))}
          aria-label="Refresh preview"
          title="Refresh preview"
        >
          <RefreshCw className="size-3" />
        </Button>
      </div>
    </div>
  );
}
