"use client";

/** Knob + lazy-loading widget halves of the VariantPreview card (VP wave) —
 *  split from variant-preview.tsx to keep both under the 200-LOC gate. */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PREVIEW_REGISTRY } from "@/lib/preview/registry.gen";
import type { SlicePreviewModule, VariantSelection } from "@/shared/preview/types";

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
      <div className="inline-flex rounded-md border border-input p-0.5">
        {values.map((v, i) => (
          <Button
            key={v}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(v)}
            className={cn(
              "h-auto rounded px-2 py-0.5 text-[11px]",
              value === v ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            {titles?.[i] ?? v}
          </Button>
        ))}
      </div>
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
  return <Widget variant={variant} />;
}
