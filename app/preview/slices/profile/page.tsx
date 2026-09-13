"use client";

import * as React from "react";
import preview from "@/features/profile/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ResumePreview = preview.Resume;
const CardPreview = preview.AboutProfile;
type Surface = "resume" | "card" | "both";

export default function Page() {
  const [surface, setSurface] = React.useState<Surface>("both");

  return (
    <SlicePreviewLayout
      title="Profile"
      kind="ui"
      description="One configured identity rendered as a printable CV and a compact avatar + links + FAQ card."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/profile"
      maxWidth="6xl"
    >
      <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
        {(["resume", "card", "both"] as const).map((value) => (
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

      {surface !== "card" ? (
        <PreviewSection title="Resume" hint="configureResume(profile)">
          <ResumePreview variant={{}} />
        </PreviewSection>
      ) : null}

      {surface !== "resume" ? (
        <PreviewSection title="Identity card" hint="configureAbout(profile)">
          <CardPreview variant={{}} />
        </PreviewSection>
      ) : null}
    </SlicePreviewLayout>
  );
}
