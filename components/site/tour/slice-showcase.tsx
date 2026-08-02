"use client";

// Per-slice preview switch for the Act pages. Server passes plain props
// (slug + resolved title/recipe/previewPath/liveMount); this client component
// picks the mount strategy:
//   • liveMount === false           → capability card (key-gated, delegated)
//   • PREVIEW_REGISTRY[slug] present → live widget, code-split-on-scroll
//   • else previewPath set          → lazy iframe of that path
//   • else                          → static info card (backend-only slice)
//
// liveMount:false is delegated to <CapabilityCard> so every Act page can route
// key-gated slugs by just passing the slice through SliceShowcase — no per-page
// branch. Marketing/os-appshell pages are unaffected: their slices are all
// liveMount:true, so this path never fires for them (backward-compatible).

import { Info } from "lucide-react";
import { PREVIEW_REGISTRY } from "@/lib/preview/registry.gen";
import { LazySliceMount } from "./lazy-slice-mount";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { CopyButton } from "@/components/site/copy-button";
import { Badge } from "@/components/ui/badge";
import { CapabilityCard } from "./capability-card";

export type ShowcaseSlice = {
  slug: string;
  title: string;
  recipe: string;
  previewPath?: string;
  liveMount: boolean;
  /** Optional copy for the static fallback (no registry + no previewPath) and
   *  for the delegated CapabilityCard's static variant. */
  description?: string;
  tagline?: string;
};

function Preview({ slug, title, previewPath, description, tagline }: ShowcaseSlice) {
  if (PREVIEW_REGISTRY[slug]) return <LazySliceMount slug={slug} />;
  if (previewPath)
    return <IframeThumbnail src={previewPath} liveTitle={title} scale={0.5} />;
  // No live widget and no preview route — a backend-only slice (e.g. rate-limit).
  // Render a static info card instead of an empty body (was: `return null`).
  return (
    <div className="flex min-h-32 flex-col gap-2 bg-muted/20 p-5 text-sm text-muted-foreground">
      <Info className="size-4 shrink-0" />
      <p className="max-w-prose leading-relaxed">
        {tagline ??
          description ??
          "Backend-only — no visual preview. Compose it into your own backend."}
      </p>
    </div>
  );
}

export function SliceShowcase(props: ShowcaseSlice) {
  const { slug, title, recipe } = props;
  // Key-gated → honest capability card (env-free demo iframe + needs-badge, or
  // a static card). Delegated so pages don't branch on liveMount themselves.
  if (!props.liveMount) {
    return (
      <CapabilityCard
        slug={slug}
        title={title}
        recipe={recipe}
        previewPath={props.previewPath}
        description={props.description}
        tagline={props.tagline}
      />
    );
  }
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
