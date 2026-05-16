"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PreviewFrame } from "@/components/site/preview-frame";
import { PREVIEW_DEFAULTS } from "@/components/site/preview";
import type { PreviewView } from "@/lib/preview-presets";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  title: string;
  defaultView?: PreviewView;
  defaultZoom?: number;
  /** Trigger label (default "Try it"). */
  triggerLabel?: string;
  /** Trigger icon (default Play). Pass null for icon-only. */
  triggerIcon?: React.ComponentType<{ className?: string }> | null;
  /** Custom max-width px override (default PREVIEW_DEFAULTS.dialogMaxWidthPx). */
  maxWidthPx?: number;
  /** Custom viewport size — vw + svh (defaults from PREVIEW_DEFAULTS). */
  viewportWidthVw?: number;
  viewportHeightSvh?: number;
  /** Override button positioning class. Default = bottom-right. */
  triggerClassName?: string;
};

/**
 * "Try it" trigger overlay → Dialog with the full interactive
 * PreviewFrame. Mirrors the icon-picker UX pattern: small affordance,
 * full surface on demand. Every knob (label, icon, sizing) overridable
 * so consumers don't need to fork the component.
 *
 * Pairs with `<IframeThumbnail>` — thumbnail is `pointer-events-none`
 * (preview only); this button opens the interactive surface.
 */
export function LivePreviewButton({
  src,
  title,
  defaultView,
  defaultZoom,
  triggerLabel = "Try it",
  triggerIcon: TriggerIcon = Play,
  maxWidthPx = PREVIEW_DEFAULTS.dialogMaxWidthPx,
  viewportWidthVw = PREVIEW_DEFAULTS.dialogViewportWidthVw,
  viewportHeightSvh = PREVIEW_DEFAULTS.dialogViewportHeightSvh,
  triggerClassName,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={(e) => {
            // Block parent <Link> so the trigger doesn't navigate when
            // user just wants to peek interactively in-place.
            e.preventDefault();
            e.stopPropagation();
          }}
          className={cn(
            "absolute bottom-2 right-2 z-10 h-7 gap-1.5 rounded-full px-2.5 text-[11px] font-medium",
            "bg-background/90 text-foreground shadow-sm backdrop-blur",
            "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
            "hover:bg-background",
            triggerClassName,
          )}
        >
          {TriggerIcon && <TriggerIcon className="size-3 fill-current" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0"
        style={{
          height: `${viewportHeightSvh}svh`,
          width: `${viewportWidthVw}vw`,
          maxWidth: `min(${maxWidthPx}px, ${viewportWidthVw}vw)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden bg-background">
          <PreviewFrame
            src={src}
            defaultView={defaultView ?? PREVIEW_DEFAULTS.view}
            defaultZoom={defaultZoom}
            className="h-full rounded-none border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
