"use client";

import { ReelEditor } from "@/features/reel-editor";

// Live preview: the full video timeline editor with a sample composition.
//  • Import media: File → Import image/video/audio (local picker, object URLs
//    — nothing uploads). The quick-import pane runs on the in-memory mock fs.
//  • Tracks are layers: top row renders frontmost; ▲▼ reorder, lock/hide/mute.
//  • Clip inspector tabs: Clip / Text / Audio / Animate / Adjust.
//  • View → Layout presets to re-arrange the workspace (resizable panes).
//  • Render (⌘E) records the live canvas + mixed audio to WebM in realtime.

export default function ReelEditorPreview() {
  return (
    <div className="h-dvh w-full">
      <ReelEditor />
    </div>
  );
}
