"use client";

/**
 * VariantPreview (VP wave) — live widget previews for selected slices.
 *
 * Reads the GENERATED registry (lib/preview/registry.gen.ts + meta JSON) —
 * nothing here is hardcoded per slice. Each widget is its own code-split
 * chunk, loaded client-side on mount; demo data lives in localStorage
 * (rr-demo:<slug>) so the VPS serves static chunks and computes nothing.
 */

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import previewMeta from "@/lib/preview/preview-meta.gen.json";
import type {
  SlicePreviewDecl,
  SlicePreviewMeta,
  VariantSelection,
} from "@/shared/preview/types";
import { Knob, LazyWidget } from "./variant-preview-widget";

const META = previewMeta as SlicePreviewMeta[];
const META_BY_SLUG = new Map(META.map((m) => [m.slug, m]));

/** All selected slices as stacked cards — live preview when the slice ships
 *  one, an explicit "no live preview" note when it doesn't (headless/server
 *  slices and template-base slices outside the preview registry). Without the
 *  note, previewless selections just vanish and read as broken. */
export function SlicePreviews({ selected }: { selected: string[] }) {
  if (selected.length === 0) return null;
  const withPreviews = selected.filter((s) => META_BY_SLUG.has(s));
  const without = selected.filter((s) => !META_BY_SLUG.has(s));
  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Slice previews ({withPreviews.length}/{selected.length})
      </h3>
      {withPreviews.map((slug) => (
        <VariantPreview key={slug} slug={slug} />
      ))}
      {without.length > 0 && (
        <div className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
          No live preview:{" "}
          {without.map((slug, i) => (
            <React.Fragment key={slug}>
              {i > 0 && ", "}
              <Badge variant="outline" className="rounded-full text-[10px]">{slug}</Badge>
            </React.Fragment>
          ))}
          <span className="ml-1">— headless / server-side, or preview not yet authored.</span>
        </div>
      )}
    </div>
  );
}

/** One slice's preview card: auto-generated knobs + the live widget.
 *  `initialVariant` (e.g. from an AI preview_slice action) seeds the knobs. */
export function VariantPreview({
  slug,
  component,
  initialVariant,
}: {
  slug: string;
  /** Restrict to one declared component (default: all). */
  component?: string;
  initialVariant?: VariantSelection;
}) {
  const meta = META_BY_SLUG.get(slug);
  if (!meta) return null;
  const decls = component
    ? meta.previews.filter((p) => p.component === component)
    : meta.previews;
  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <Badge variant="outline" className="rounded-full text-[10px]">{slug}</Badge>
        <span className="truncate text-[11px] text-muted-foreground">{meta.title}</span>
      </div>
      {decls.map((decl) => (
        <PreviewDecl key={decl.component} slug={slug} decl={decl} initialVariant={initialVariant} />
      ))}
    </div>
  );
}

function defaultsFor(decl: SlicePreviewDecl): VariantSelection {
  if (decl.kind === "scenarios") {
    return { scenario: decl.scenarios?.[0]?.id ?? "" };
  }
  const out: VariantSelection = {};
  for (const ax of decl.axes ?? []) out[ax.prop] = ax.default ?? ax.values[0];
  return out;
}

function PreviewDecl({
  slug, decl, initialVariant,
}: {
  slug: string;
  decl: SlicePreviewDecl;
  initialVariant?: VariantSelection;
}) {
  const [variant, setVariant] = React.useState<VariantSelection>(() => ({
    ...defaultsFor(decl),
    ...initialVariant,
  }));
  const [resetKey, setResetKey] = React.useState(0);

  return (
    <div className="p-3">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        {decl.kind === "variants"
          ? (decl.axes ?? []).map((ax) => (
              <Knob
                key={ax.prop}
                label={ax.prop}
                values={ax.values}
                value={variant[ax.prop]}
                onChange={(v) => setVariant((s) => ({ ...s, [ax.prop]: v }))}
              />
            ))
          : (
              <Knob
                label="scenario"
                values={(decl.scenarios ?? []).map((s) => s.id)}
                titles={(decl.scenarios ?? []).map((s) => s.title ?? s.id)}
                value={variant.scenario}
                onChange={(v) => setVariant({ scenario: v })}
              />
            )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto size-6 text-muted-foreground"
          title="Reset demo data (clears rr-demo localStorage for this slice)"
          onClick={() => {
            try {
              for (const k of Object.keys(window.localStorage)) {
                if (k.startsWith(`rr-demo:${slug}:`)) window.localStorage.removeItem(k);
              }
            } catch {
              // ignore
            }
            setResetKey((n) => n + 1);
          }}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
      <div className="overflow-auto rounded-md border border-border/60 bg-background">
        <LazyWidget key={resetKey} slug={slug} component={decl.component} variant={variant} />
      </div>
    </div>
  );
}
