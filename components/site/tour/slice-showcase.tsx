"use client";

// Per-slice preview switch for the Act pages. Server passes plain props
// (slug + resolved title/recipe/previewPath/liveMount); this client component
// picks the mount strategy:
//   • PREVIEW_REGISTRY[slug] present → live widget, code-split-on-scroll
//   • else previewPath set          → lazy iframe of that path
//   • liveMount === false           → capability card (key-gated)

import { Lock } from "lucide-react";
import { PREVIEW_REGISTRY } from "@/lib/preview/registry.gen";
import { LazySliceMount } from "./lazy-slice-mount";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { CopyButton } from "@/components/site/copy-button";
import { Badge } from "@/components/ui/badge";

export type ShowcaseSlice = {
  slug: string;
  title: string;
  recipe: string;
  previewPath?: string;
  liveMount: boolean;
};

function Preview({ slug, title, previewPath, liveMount }: ShowcaseSlice) {
  if (!liveMount) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/30 text-center text-sm text-muted-foreground">
        <Lock className="size-4" />
        <span>Needs a key — preview runs in your own backend.</span>
      </div>
    );
  }
  if (PREVIEW_REGISTRY[slug]) return <LazySliceMount slug={slug} />;
  if (previewPath)
    return <IframeThumbnail src={previewPath} liveTitle={title} scale={0.5} />;
  return null;
}

export function SliceShowcase(props: ShowcaseSlice) {
  const { slug, title, recipe } = props;
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <Badge variant="outline" className="rounded-full text-[10px]">
          {slug}
        </Badge>
        <code className="ml-auto min-w-0 flex-1 truncate rounded bg-muted/50 px-2 py-1 text-right font-mono text-xs text-muted-foreground sm:max-w-[18rem]">
          {recipe}
        </code>
        <CopyButton value={recipe} size="icon" className="h-7 w-7 shrink-0" />
      </div>
      <div className="overflow-hidden rounded-md border bg-background">
        <Preview {...props} />
      </div>
    </div>
  );
}
