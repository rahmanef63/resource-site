"use client";

import * as React from "react";
import preview from "@/features/command-menu/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CommandPreview = preview.CommandPalette;
type Scope = "all" | "commands";

export default function Page() {
  const [scope, setScope] = React.useState<Scope>("all");

  return (
    <SlicePreviewLayout
      title="Command Menu"
      kind="ui"
      description="Portable command groups, query visibility, and command-palette chrome over the canonical preview module."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/command-menu"
    >
      <PreviewSection title="Palette groups" hint={`scope="${scope}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["all", "commands"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              onClick={() => setScope(value)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                scope === value ? "bg-accent font-medium" : "text-muted-foreground",
              )}
            >
              {value}
            </Button>
          ))}
        </div>
        <CommandPreview variant={{ scope }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
