"use client";

import * as React from "react";
import { FeatureGridSection, type FeatureItem, type FeatureGroup } from "@/features/feature-grid";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, Shield, Layers, Sparkles, GitBranch, Globe } from "lucide-react";

const ITEMS: FeatureItem[] = [
  { id: "1", title: "Lightning fast", body: "Edge-cached responses with sub-100ms p95 latency across 200+ POPs.", icon: Zap },
  { id: "2", title: "Secure by default", body: "SOC 2 Type II + GDPR + HIPAA — encryption at rest and in transit out of the box.", icon: Shield },
  { id: "3", title: "Composable stack", body: "Pluggable modules, swap any layer without rewriting the rest of your app.", icon: Layers },
  { id: "4", title: "AI-native", body: "First-class streaming, function calling, and vector search built into every primitive.", icon: Sparkles },
  { id: "5", title: "Git-native deploys", body: "Push to main = production. PR previews on every branch.", icon: GitBranch, link: { label: "See deploy docs", href: "#" } },
  { id: "6", title: "Global edge", body: "Multi-region replicas keep data close to your users without manual orchestration.", icon: Globe },
];

const GROUPS: FeatureGroup[] = [
  { id: "perf", label: "Performance", sublabel: "Speed + scale", items: ITEMS.slice(0, 3) },
  { id: "dev", label: "Developer experience", sublabel: "Workflow", items: ITEMS.slice(3, 6) },
];

const LAYOUTS = ["cards", "minimal", "alternating", "grouped"] as const;

export default function Page() {
  const [layout, setLayout] = React.useState<(typeof LAYOUTS)[number]>("cards");
  return (
    <SlicePreviewLayout title="Feature Grid" kind="ui" maxWidth="none">
      <PreviewSection title="Live demo" hint={`layout="${layout}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {LAYOUTS.map((v) => (
            <Button
              key={v}
              variant="ghost"
              type="button"
              onClick={() => setLayout(v)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs capitalize",
                layout === v ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </Button>
          ))}
        </div>

        <FeatureGridSection
          eyebrow="Features"
          title="Everything you need to ship"
          subtitle="Production-grade primitives, batteries included. Pick what you need, drop what you don't."
          items={layout === "grouped" ? undefined : ITEMS}
          groups={layout === "grouped" ? GROUPS : undefined}
          layout={layout}
          columns={3}
        />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
