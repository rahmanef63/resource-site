"use client";

import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { useFeatures } from "../../shared/store";

export function FeaturesPage() {
  const features = useFeatures();
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Features"
          title="Everything you need to ship a signed PDF"
          subtitle="One opinionated API, audit-ready by default."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.id} className="rounded-lg border border-border/60 bg-card p-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{f.icon}</p>
              <h3 className="mt-2 text-base font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
