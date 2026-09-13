"use client";

import * as React from "react";
import preview from "@/features/system-monitor/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MonitorPreview = preview.SystemMonitor;
type Scenario = "wide" | "compact";

export default function Page() {
  const [scenario, setScenario] = React.useState<Scenario>("wide");

  return (
    <SlicePreviewLayout
      title="System Monitor"
      kind="ui"
      description="Injected host telemetry with zero-backend mock, rolling CPU/network history, gauges, sparklines, and responsive process rows."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/system-monitor"
      maxWidth="6xl"
    >
      <PreviewSection title="Telemetry dashboard" hint={`scenario="${scenario}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["wide", "compact"] as const).map((value) => (
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
        <MonitorPreview variant={{ scenario }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
