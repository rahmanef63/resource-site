"use client";

import * as React from "react";
import preview from "@/features/activity/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ActivityPreview = preview.ActivityFeed;
type Scenario = "with-stats" | "feed-only" | "empty";
const SCENARIOS: Scenario[] = ["with-stats", "feed-only", "empty"];

export default function Page() {
  const [scenario, setScenario] = React.useState<Scenario>("with-stats");

  return (
    <SlicePreviewLayout
      title="Activity"
      kind="full"
      description="Public weekly activity feed with ISO-week grouping, locale-aware formatting, optional stats, and empty state."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/activity"
    >
      <PreviewSection title="Live activity feed" hint={`scenario="${scenario}"`}>
        <div className="mb-4 inline-flex flex-wrap rounded-md border border-input p-0.5">
          {SCENARIOS.map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              onClick={() => setScenario(value)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                scenario === value ? "bg-accent font-medium" : "text-muted-foreground",
              )}
            >
              {value}
            </Button>
          ))}
        </div>
        <ActivityPreview variant={{ scenario }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
