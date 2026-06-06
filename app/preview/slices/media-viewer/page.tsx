"use client";

import { MediaViewer } from "@/features/media-viewer";

// Live preview: the quick-look viewer on its offline sample gallery.
//  • Prev/next cycles image / video / audio / pdf / text samples.
//  • Images: zoom 40–300% on a checkerboard stage (transparency reads).
//  • Audio/video: transport players (simulated playback — no real bytes).
//  • "Open in editor" routes through configureMediaOpener (no-op here).
//  • Real files: <MediaViewer payload={{ path, name, kind }} /> + an optional
//    configureMediaSource({ rawUrl }) to resolve private fs paths.

export default function MediaViewerPreview() {
  return (
    <div className="h-dvh w-full">
      <MediaViewer />
    </div>
  );
}
