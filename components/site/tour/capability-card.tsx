"use client";

// Capability card for KEY-GATED tour slices (liveMount:false).
//
// A key-gated slice (payments, AI proxies, transactional email, bookings, MCP,
// vector search) cannot run its REAL action in the public tour — that needs a
// paid/external key (+ sometimes Convex). But its demo UI still renders
// env-free. So instead of a dead "live" button or a blind dashed placeholder,
// this card is honest in two ways:
//
//   • Slice HAS a previewPath whose UI renders env-free → iframe that preview
//     (lazy, via IframeThumbnail's own IntersectionObserver) and overlay a
//     prominent "Demo mode · needs <KEY> for live <action>" badge. The visitor
//     sees the real component; the badge tells them it's a mock, not wired.
//   • Slice has NO previewPath (or its UI errors without a backend) → a STATIC
//     card: a poster (next/image) if one exists, else a Lock icon + the slice
//     tagline/description, with the same needs-badge.
//
// Both variants surface the `npx rahman-resources add <slug>` recipe and a
// "Try with your key" hint, so the path from "interesting" to "shipped" is one
// copy away.
//
// NO convex import (Hard Rule 6 — the tour is client/localStorage/env-free).
// shadcn-only. The per-slug needs text + poster live in ./capability-needs.

import Image from "next/image";
import { KeyRound, Lock } from "lucide-react";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { CopyButton } from "@/components/site/copy-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { needsFor, type Needs } from "./capability-needs";

/** Props the Act pages pass per key-gated slice. Server-resolved, all plain. */
export type CapabilityCardProps = {
  slug: string;
  title: string;
  /** `npx rahman-resources add <slug>` line. */
  recipe: string;
  /** Env-free demo route. Present ⇒ iframe variant; absent ⇒ static variant. */
  previewPath?: string;
  /** Long-form copy for the static variant when no poster exists. */
  description?: string;
  /** Short hook; preferred over `description` in the static body. */
  tagline?: string;
};

/** The "Demo mode · needs <key> for live <action>" pill — the honesty signal. */
function NeedsBadge({ needs, className }: { needs: Needs; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        className,
      )}
    >
      <KeyRound className="size-3" />
      <span className="font-medium">Demo mode</span>
      <span className="text-muted-foreground">
        · needs {needs.key} for live {needs.action}
      </span>
    </Badge>
  );
}

/** Iframe variant — env-free preview UI behind a prominent needs-badge overlay. */
function DemoPreview({
  previewPath,
  title,
  needs,
}: {
  previewPath: string;
  title: string;
  needs: Needs;
}) {
  return (
    <div className="relative">
      {/* Lazy iframe (IframeThumbnail mounts on scroll via its own observer).
          pointer-events disabled inside, so there's no dead "live" button. */}
      <IframeThumbnail
        src={previewPath}
        liveTitle={title}
        hideLiveTrigger
        scale={0.5}
      />
      {/* Overlay badge — top-left so it reads first, above the gradient. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-start p-2">
        <NeedsBadge needs={needs} className="pointer-events-auto shadow-sm" />
      </div>
    </div>
  );
}

/** Static variant — poster (if any) or Lock+copy, for no-previewPath slices. */
function StaticPreview({
  title,
  description,
  tagline,
  needs,
}: {
  title: string;
  description?: string;
  tagline?: string;
  needs: Needs;
}) {
  const blurb =
    tagline ??
    description ??
    "Backend-only — no visual preview. Compose it into your own backend.";
  return (
    <div className="flex min-h-40 flex-col gap-3 bg-muted/20 p-5">
      {needs.poster ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <Image
            src={needs.poster}
            alt={`${title} preview`}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 top-0 flex justify-start p-2">
            <NeedsBadge needs={needs} className="shadow-sm" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md border bg-background text-muted-foreground">
              <Lock className="size-4" />
            </span>
            <NeedsBadge needs={needs} />
          </div>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {blurb}
          </p>
        </>
      )}
    </div>
  );
}

export function CapabilityCard({
  slug,
  title,
  recipe,
  previewPath,
  description,
  tagline,
}: CapabilityCardProps) {
  const needs = needsFor(slug);
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {/* Header mirrors SliceShowcase: title · slug · recipe · copy. */}
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

      {/* Body — env-free demo iframe, or a static card when there's nothing
          safe to mount. Either way the needs-badge keeps it honest. */}
      <div className="overflow-hidden rounded-md border bg-background">
        {previewPath ? (
          <DemoPreview previewPath={previewPath} title={title} needs={needs} />
        ) : (
          <StaticPreview
            title={title}
            description={description}
            tagline={tagline}
            needs={needs}
          />
        )}
      </div>

      {/* The path from "interesting" to "shipped" — one copy + your key. */}
      <p className="text-xs text-muted-foreground">
        Try with your key — add the slice, set {needs.key}, and the live action
        runs in your own backend.
      </p>
    </div>
  );
}
