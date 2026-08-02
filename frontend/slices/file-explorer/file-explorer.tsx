"use client";

import { useMemo } from "react";
import {
  FileExplorerAdapterProvider,
  type FileExplorerAdapter,
  type FsEntry,
} from "./adapter";
import { getFileExplorerAdapter } from "./lib/backend";
import { ExplorerView } from "./components/explorer-view";

export type FileExplorerProps = {
  /** Backend. Omit to use the one configured in `lib/backend.ts`
   * (defaults to the in-memory mock). Pass `createMockAdapter()` /
   * `createLiveAdapter(...)` / `createConvexAdapter(...)` to override. */
  adapter?: FileExplorerAdapter;
  initialPath?: string;
  /** Breadcrumb root label, default "Files". */
  rootLabel?: string;
  /** Invoked when a file (not a folder) is opened. Undefined => opening is a no-op. */
  onOpenFile?: (path: string, entry: FsEntry) => void;
  className?: string;
};

// Standalone, backend-agnostic file explorer. Wraps itself in the adapter
// provider so `<FileExplorer />` Just Works with no props — it falls back to
// the backend chosen in lib/backend.ts (mock by default). Full-height: the
// consumer owns the surrounding box.
export function FileExplorer({
  adapter,
  initialPath,
  rootLabel = "Files",
  onOpenFile,
  className,
}: FileExplorerProps) {
  const resolved = useMemo(() => adapter ?? getFileExplorerAdapter(), [adapter]);
  return (
    <FileExplorerAdapterProvider adapter={resolved}>
      <ExplorerView
        initialPath={initialPath}
        rootLabel={rootLabel}
        onOpenFile={onOpenFile}
        className={className}
      />
    </FileExplorerAdapterProvider>
  );
}
