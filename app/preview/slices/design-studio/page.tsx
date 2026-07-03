"use client";

import { MediaStudio } from "@/features/design-studio";

// Live preview: the offline design canvas on its demo composition.
//  • Tools V/T/R/O/S place layers; drag with Move; ⌘Z / ⇧⌘Z history.
//  • Adjust tab: filters, aspect presets, platform safe-area guides.
//  • Export modal: os-rr/layers@1 JSON or standalone HTML, plus re-import.
//  • Real host: configureMediaStudio({ saveDoc, imageSources }).

export default function MediaStudioPreview() {
  return (
    <div className="h-dvh w-full">
      <MediaStudio />
    </div>
  );
}
