"use client";

import { useMemo } from "react";
import { FileExplorer, createMockAdapter } from "@/features/file-explorer";

// Live preview: the file explorer mounted on the bundled in-memory mock adapter.
// createMockAdapter() is fully writable, so new folder / rename / cut-copy-paste /
// move (drag) / delete / upload all work right here with no backend. Browse the
// tree, click breadcrumbs, toggle grid/list, right-click for the context menu.

export default function FileExplorerPreview() {
  const adapter = useMemo(() => createMockAdapter(), []);
  return (
    <div className="h-dvh w-full bg-background">
      <FileExplorer
        adapter={adapter}
        rootLabel="Files"
        onOpenFile={(path, entry) => console.log("open file", entry.name, path)}
      />
    </div>
  );
}
