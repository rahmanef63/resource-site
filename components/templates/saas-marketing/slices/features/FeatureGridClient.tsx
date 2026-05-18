"use client";

import { useFeatures } from "../../shared/store";

/**
 * Client-side data grid for the public Features page. Reads live items from
 * the template store via useFeatures(), so admin edits propagate via the
 * BroadcastChannel sync in createTemplateStore (cross-tab live update).
 */
export function FeatureGridClient() {
  const features = useFeatures();
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div key={f.id} className="rounded-lg border border-border/60 bg-card p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {f.icon}
          </p>
          <h3 className="mt-2 text-base font-medium">{f.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{f.blurb}</p>
        </div>
      ))}
    </div>
  );
}
