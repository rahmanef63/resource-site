// Compact header strip for slice detail page — mirrors TemplateDetail
// header pattern so /slices/<slug> and /layouts/<slug> have identical
// docs-shell behavior (small header above FeatureBar + tabs).
//
// BS-fix (2026-05-20) — was a tall 6-section pile before, which pushed
// the FeatureBar tab strip + iframe preview off-screen since the
// docs-shell does NOT scroll-wrap `{children}` when `hasTabs`.

import Link from "next/link";
import { ArrowLeft, ExternalLink, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyPageButton } from "@/components/site/copy-page-button";
import { RecentlyUpdatedBadge } from "@/components/site/recently-updated-badge";
import { MaturityBadge } from "@/components/site/maturity-badge";
import { getDemoUrl } from "@/lib/content/template-subdomains";
import type { SliceEntry } from "@/lib/content/slices";

const KIND_CLASS = {
  ui: "bg-emerald-500/15 text-emerald-300",
  backend: "bg-blue-500/15 text-blue-300",
  full: "bg-purple-500/15 text-purple-300",
} as const;

export function SliceDetailHeader({
  slice,
  siteUrl,
  installCommand,
}: {
  slice: SliceEntry;
  siteUrl: string;
  installCommand: string;
}) {
  const demoUrl = getDemoUrl(slice.slug);
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-background/60 px-4 py-3">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-1.5">
          <Link
            href="/slices"
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> All modules
          </Link>
          <Badge variant="secondary" className="rounded-full text-[10px]">
            v{slice.version}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] capitalize">
            {slice.category}
          </Badge>
          {slice.kind && (
            <Badge
              className={
                "rounded-full text-[10px] uppercase " +
                (KIND_CLASS[slice.kind as keyof typeof KIND_CLASS] ?? KIND_CLASS.full)
              }
            >
              {slice.kind}
            </Badge>
          )}
          <MaturityBadge status={slice.maturity} />
          <RecentlyUpdatedBadge slug={slice.slug} kind="slice" />
        </div>
        <h1 className="flex items-center gap-2 truncate text-lg font-semibold tracking-tight">
          <Layers className="size-4 shrink-0 text-muted-foreground" />
          {slice.title}
        </h1>
      </div>
      <div className="flex items-center gap-1">
        {demoUrl && (
          <Button asChild variant="outline" size="sm" className="hidden gap-1.5 text-xs sm:inline-flex">
            <Link href={demoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3" />
              Live demo
            </Link>
          </Button>
        )}
        <CopyPageButton
          title={slice.title}
          url={`${siteUrl}/slices/${slice.slug}`}
          body={installCommand}
        />
      </div>
    </header>
  );
}
