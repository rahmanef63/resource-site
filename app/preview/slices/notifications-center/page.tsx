"use client";

import * as React from "react";
import preview from "@/features/notifications-center/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BellPreview = preview.NotificationBell;
const ListPreview = preview.NotificationList;
type Surface = "popover" | "sheet";
type Scenario = "mixed" | "all-read" | "empty";

export default function Page() {
  const [surface, setSurface] = React.useState<Surface>("popover");
  const [scenario, setScenario] = React.useState<Scenario>("mixed");

  return (
    <SlicePreviewLayout
      title="Notifications Center"
      kind="ui"
      description="Adapter-driven bell and inbox with shared unread, sorting, filter, and mutation semantics."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/notifications-center"
      maxWidth="6xl"
    >
      <PreviewSection title="Bell surface" hint={`surface="${surface}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["popover", "sheet"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              onClick={() => setSurface(value)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                surface === value ? "bg-accent font-medium" : "text-muted-foreground",
              )}
            >
              {value}
            </Button>
          ))}
        </div>
        <BellPreview variant={{ surface }} />
      </PreviewSection>

      <PreviewSection title="Inbox scenarios" hint={`scenario="${scenario}"`}>
        <div className="mb-4 inline-flex flex-wrap rounded-md border border-input p-0.5">
          {(["mixed", "all-read", "empty"] as const).map((value) => (
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
        <ListPreview variant={{ scenario }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
