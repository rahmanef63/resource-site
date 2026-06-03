"use client";

// Catalog thumbnail for templates whose demo lives on an EXTERNAL Vercel
// deployment (SLUG_TO_DEMO_URL). The grid shows a light static poster — no live
// iframe per card — and the live deployed app loads on demand via the "Try live
// demo" dialog (cross-origin iframe of the Vercel URL). This is the "lazy poster
// → live iframe" mode: the catalog stays light, the demo is the real app, and rr
// no longer needs to render that template's /preview for the catalog.

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { MockThumbnail } from "./mock-thumbnail";
import { LivePreviewButton } from "./live-preview-button";

export function DemoThumbnail({
  demoUrl,
  title,
  category = "marketing",
  className,
}: {
  demoUrl: string;
  title: string;
  category?: string;
  className?: string;
}) {
  return (
    <div className={cn("group relative h-full w-full overflow-hidden", className)}>
      {/* Static poster — CSS-only, zero network until the user opts in. */}
      <MockThumbnail kind="marketing" category={category} label={title} />

      {/* Live badge */}
      <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/80 backdrop-blur">
        <span className="size-1.5 rounded-full bg-emerald-500" /> Live · Vercel
      </span>

      {/* Hover scrim + "Try live demo" → dialog loads the real Vercel app. */}
      <div className="absolute inset-0 z-10 grid place-items-center bg-background/0 transition-colors duration-300 group-hover:bg-background/40">
        <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <LivePreviewButton
            src={demoUrl}
            externalUrl={demoUrl}
            title={title}
            triggerLabel="Try live demo"
            triggerIcon={ExternalLink}
            triggerClassName="static"
          />
        </div>
      </div>
    </div>
  );
}
