"use client";

import { FileExplorer } from "@/features/file-explorer";

// Live preview: <FileExplorer /> with NO props. It falls back to the backend
// chosen in slices/file-explorer/lib/backend.ts — the in-memory mock by default,
// which is fully writable. New folder / rename / cut-copy-paste / move (drag) /
// delete / upload all work here with zero backend. Browse the tree, click
// breadcrumbs, toggle grid/list, right-click for the context menu.
//
// To point it at a real filesystem: edit lib/backend.ts (FILE_EXPLORER_BACKEND =
// "live" | "convex") or set NEXT_PUBLIC_FILE_EXPLORER_BACKEND — nothing else changes.

export default function FileExplorerPreview() {
  return (
    <div className="h-dvh w-full bg-background">
      <FileExplorer
        rootLabel="Files"
        onOpenFile={(path, entry) => console.log("open file", entry.name, path)}
      />
    </div>
  );
}
