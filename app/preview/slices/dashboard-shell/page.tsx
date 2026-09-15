"use client";

import * as React from "react";
import preview from "@/features/dashboard-shell/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DashboardShellPreview = preview.DashboardShell;
type Scenario = "desktop" | "secondary" | "mobile-dock" | "mobile-menu";

const SCENARIOS: Scenario[] = [
  "desktop",
  "secondary",
  "mobile-dock",
  "mobile-menu",
];

export default function Page() {
  const [scenario, setScenario] = React.useState<Scenario>("desktop");

  return (
    <SlicePreviewLayout
      title="Dashboard Shell — Responsive"
      kind="ui"
      description="One nav SSOT drives the desktop rail/topbar and the mobile dock + thumbnail-tile drawer."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/dashboard-shell"
    >
      <PreviewSection title="Live shell" hint={`scenario="${scenario}"`}>
        <div className="mb-4 flex flex-wrap gap-1 rounded-md border border-input p-1">
          {SCENARIOS.map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              onClick={() => setScenario(value)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                scenario === value
                  ? "bg-accent font-medium"
                  : "text-muted-foreground",
              )}
            >
              {value}
            </Button>
          ))}
        </div>
        <DashboardShellPreview variant={{ scenario }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
