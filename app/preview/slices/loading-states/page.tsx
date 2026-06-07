"use client";

import {
  LoadingSkeleton,
  LoadingState,
  LOADING_KINDS,
} from "@/features/loading-states";
import {
  SlicePreviewLayout,
  PreviewSection,
} from "@/components/slice-previews/preview-layout";

export default function Page() {
  return (
    <SlicePreviewLayout title="Loading States" kind="ui" maxWidth="none">
      <PreviewSection
        title="LoadingSkeleton — all kinds"
        hint="7 presets composed on shadcn Skeleton"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {LOADING_KINDS.map((kind) => (
            <div key={kind} className="space-y-2">
              <p className="font-mono text-xs text-muted-foreground">
                kind=&quot;{kind}&quot;
              </p>
              <LoadingSkeleton
                kind={kind}
                className={kind === "block" ? "h-32" : undefined}
              />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection
        title="LoadingState — spinner variants"
        hint="inline · block · overlay, on shadcn Spinner"
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <p className="text-sm">
            Sync status: <LoadingState variant="inline" label="Refreshing…" />
          </p>
          <LoadingState variant="block" label="Loading workspace…" />
          <div className="relative rounded-lg border p-4">
            <LoadingSkeleton kind="text" />
            <LoadingState variant="overlay" label="Saving…" />
          </div>
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
