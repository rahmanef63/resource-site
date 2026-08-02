"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { ChangelogFeedSection, type ChangelogEntry } from "./views/ChangelogFeedSection";

const ENTRIES: ChangelogEntry[] = [
  {
    id: "1",
    version: "1.10.0",
    date: Date.parse("2026-06-05"),
    kind: "feature",
    title: "Variant previews",
    body: "Slices now preview their layout variants like shadcn primitives.",
    bullets: ["Per-slice preview.tsx", "Builder knobs auto-generated"],
  },
  {
    id: "2",
    version: "1.9.1",
    date: Date.parse("2026-05-30"),
    kind: "improvement",
    title: "Theme presets",
    body: "Site-default layer plus a wizard preset picker.",
  },
  {
    id: "3",
    version: "1.9.0",
    date: Date.parse("2026-05-16"),
    kind: "breaking",
    title: "BSDL removed",
    body: "Dropped per-slice sync manifests for a simpler copy-first flow.",
  },
];

const preview: SlicePreviewModule = {
  ChangelogFeedSection: ({ variant }) => (
    <div className="p-4">
      <ChangelogFeedSection
        title="What's new"
        entries={ENTRIES}
        layout={(variant.layout as "timeline" | "cards" | "list") ?? "timeline"}
        className="px-0 py-0"
      />
    </div>
  ),
};
export default preview;
