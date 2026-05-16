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
import type { PreviewView } from "@/lib/preview-presets";
import { cn } from "@/lib/utils";

type Props = {
  /** Live preview iframe src. */
  src: string;
  /** Title shown in the dialog header. */
  title: string;
  /** Initial viewport — falls back to "desktop". */
  defaultView?: PreviewView;
  /** Initial zoom — falls back to PreviewFrame's default. */
  defaultZoom?: number;
  /** Optional positioning override. Defaults to bottom-right of the
   *  parent — assumes parent is `relative`. */
  className?: string;
};

/**
 * Catalog thumbnail trigger that opens a Dialog containing the full
 * `PreviewFrame` (zoom / viewport / orient / fullscreen controls).
 *
 * Pairs with `<IframeThumbnail>` which renders the static preview. The
 * button overlay differentiates the two:
 *
 *   thumbnail iframe = pointer-events-none (visual only)
 *   button overlay   = click → interactive Dialog (this component)
 *
 * Mirrors the icon-picker trigger pattern: small affordance, full
 * surface on demand.
 */
export function LivePreviewButton({
  src,
  title,
  defaultView,
  defaultZoom,
  className,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          // Stop the parent <Link> from navigating when the user wants
          // to peek interactively in-place.
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={cn(
            "absolute bottom-2 right-2 z-10 h-7 gap-1.5 rounded-full px-2.5 text-[11px] font-medium",
            "bg-background/90 text-foreground shadow-sm backdrop-blur",
            "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
            "hover:bg-background",
            className,
          )}
        >
          <Play className="size-3 fill-current" />
          Try it
        </Button>
      </DialogTrigger>
      <DialogContent
        // Responsive container — fills viewport on mobile/tablet, caps
        // at ~960px on desktop so it doesn't dwarf the preview canvas.
        // `top-[50%]` + `translate-y-[-50%]` inherited from shadcn so it
        // stays centered as size changes.
        className="flex h-[92svh] w-[96vw] !max-w-[min(960px,96vw)] flex-col gap-0 overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden bg-background">
          <PreviewFrame
            src={src}
            defaultView={defaultView ?? "desktop"}
            defaultZoom={defaultZoom}
            className="h-full rounded-none border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
