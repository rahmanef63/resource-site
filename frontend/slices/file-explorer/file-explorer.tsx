"use client";

import {
  FileExplorerAdapterProvider,
  type FileExplorerAdapter,
  type FsEntry,
} from "./adapter";
import { ExplorerView } from "./components/explorer-view";

export type FileExplorerProps = {
  /** Required backend. Use `createMockAdapter()` for a zero-config in-memory demo. */
  adapter: FileExplorerAdapter;
  initialPath?: string;
  /** Breadcrumb root label, default "Files". */
  rootLabel?: string;
  /** Invoked when a file (not a folder) is opened. Undefined => opening is a no-op. */
  onOpenFile?: (path: string, entry: FsEntry) => void;
  className?: string;
};

// Standalone, backend-agnostic file explorer. Wraps itself in the adapter
// provider so `<FileExplorer adapter={…} />` Just Works without the consumer
// wiring a provider. Full-height: the consumer owns the surrounding box.
export function FileExplorer({
  adapter,
  initialPath,
  rootLabel = "Files",
  onOpenFile,
  className,
}: FileExplorerProps) {
  return (
    <FileExplorerAdapterProvider adapter={adapter}>
      <ExplorerView
        initialPath={initialPath}
        rootLabel={rootLabel}
        onOpenFile={onOpenFile}
        className={className}
      />
    </FileExplorerAdapterProvider>
  );
}
