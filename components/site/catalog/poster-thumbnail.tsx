"use client";

// Catalog thumbnail = a REAL screenshot poster of the template (public/
// template-posters/<slug>.png) + an always-visible CTA. Replaces the old
// live-iframe-in-grid (which rendered blank/skeleton while lazy-loading) and the
// CSS mock (which looked like a wireframe). The poster is light + accurate; the
// live surface loads on demand:
//   - external Vercel demo published  → "Live demo" dialog loads the real app
//   - otherwise                       → "Preview" dialog loads the local /preview
import * as React from "react";
import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import type { PreviewView } from "@/lib/preview-presets";
import { LivePreviewButton } from "./live-preview-button";

export function PosterThumbnail({
  slug,
  title,
  demoUrl,
  previewPath,
  defaultView,
  defaultZoom,
}: {
  slug: string;
  title: string;
  demoUrl?: string | null;
  previewPath?: string | null;
  defaultView?: PreviewView;
  defaultZoom?: number;
}) {
  const src = `/template-posters/${slug}.png`;
  return (
    // Posters are 1280x800 (16:10). Set an explicit aspect so the slot has
    // height — the card's thumbnail container is height-less and relies on the
    // child to size itself (the old IframeThumbnail set its own aspectRatio).
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30">
      <Image
        src={src}
        alt={`${title} preview`}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover object-top"
      />
      {demoUrl ? (
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/80 backdrop-blur">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Live · Vercel
        </span>
      ) : null}
      {/* Always-visible CTA (LivePreviewButton defaults to bottom-right). */}
      {demoUrl ? (
        <LivePreviewButton
          src={demoUrl}
          externalUrl={demoUrl}
          title={title}
          triggerLabel="Live demo"
          triggerIcon={ExternalLink}
        />
      ) : previewPath ? (
        <LivePreviewButton
          src={previewPath}
          title={title}
          triggerLabel="Preview"
          triggerIcon={Play}
          defaultView={defaultView}
          defaultZoom={defaultZoom}
        />
      ) : null}
    </div>
  );
}
