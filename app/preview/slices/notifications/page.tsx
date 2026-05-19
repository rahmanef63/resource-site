"use client";

import * as React from "react";
import { NotifyMePopover } from "@/features/notifications";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

/** Per-page "notify me" subscription toggle.
 *  State persisted in localStorage under `notion-clone:subscriptions:v1`. */
export default function Page() {
  return (
    <SlicePreviewLayout title="Notifications" kind="ui">
      <PreviewSection
        title="Live demo"
        hint='click the bell · choose scopes · state persists in localStorage (key: "notion-clone:subscriptions:v1")'
      >
        <div className="flex items-center gap-12 rounded-lg border border-border bg-card p-12">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">Page A</p>
            <NotifyMePopover pageId="demo-page-a" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">Page B</p>
            <NotifyMePopover pageId="demo-page-b" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">Page C</p>
            <NotifyMePopover pageId="demo-page-c" />
          </div>
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
