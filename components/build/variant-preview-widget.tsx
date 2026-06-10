"use client";

/** Knob + lazy-loading widget halves of the VariantPreview card (VP wave) —
 *  split from variant-preview.tsx to keep both under the 200-LOC gate. */

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PREVIEW_REGISTRY } from "@/lib/preview/registry.gen";
import type { SlicePreviewModule, VariantSelection } from "@/shared/preview/types";

/** One variant axis as a compact shadcn Tabs strip — the same control on every
 *  slice's Live tab and in the Bundle Builder, so variant switching reads
 *  identically across the catalog. */
export function Knob({
  label, values, titles, value, onChange,
}: {
  label: string;
  values: string[];
  titles?: string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Tabs value={value ?? values[0]} onValueChange={onChange} className="w-fit">
        <TabsList className="p-0.5 group-data-[orientation=horizontal]/tabs:h-7">
          {values.map((v, i) => (
            <TabsTrigger key={v} value={v} className="px-2 py-0.5 text-[11px]">
              {titles?.[i] ?? v}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

/** Loads the slice's preview module client-side (one chunk per slug). */
export function LazyWidget({
  slug, component, variant,
}: {
  slug: string;
  component: string;
  variant: VariantSelection;
}) {
  const [mod, setMod] = React.useState<SlicePreviewModule | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setMod(null);
    setErr(null);
    PREVIEW_REGISTRY[slug]?.()
      .then((m) => { if (alive) setMod(m.default); })
      .catch((e) => { if (alive) setErr(e?.message ?? "failed to load preview"); });
    return () => { alive = false; };
  }, [slug]);

  if (err) {
    return <div className="p-4 text-xs text-destructive">preview failed: {err}</div>;
  }
  if (!mod) {
    return <div className="h-24 animate-pulse bg-muted/40" />;
  }
  const Widget = mod[component];
  if (!Widget) {
    return (
      <div className="p-4 text-xs text-muted-foreground">
        preview.tsx has no export for “{component}”
      </div>
    );
  }
  // Remount on every variant change: axes often feed initial state only
  // (e.g. convex-auth `defaultPasswordMode` → useState), so a re-render
  // without a remount silently ignores the knob.
  return <Widget key={JSON.stringify(variant)} variant={variant} />;
}
