"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { FsEntry } from "../adapter";
import { DropOverlay } from "./drop-overlay";
import { FilesSidebar } from "./files-sidebar";
import { FilesToolbar } from "./files-toolbar";
import { FileView } from "./file-view";
import { FileContextMenu } from "./file-context-menu";
import { FileDetails } from "./file-details";
import { FileStatusBar } from "./file-status-bar";
import { UploadInput } from "./upload-input";
import type { FilePickerHandle } from "@/shared/ui/FilePicker";
import { useAgentTools } from "@/shared/agentic";
import { fileExplorerTools } from "../lib/tools";
import { useFiles } from "../hooks/use-files";
import { useFileSelection } from "../hooks/use-file-selection";
import { useFileCommands } from "../hooks/use-file-commands";
import { useDnd } from "../hooks/use-dnd";
import { useWindowDrop } from "../hooks/use-window-drop";
import { sortEntries, type SortKey, type ViewMode } from "../lib/types";

// The explorer body. Assumes a FileExplorerAdapterProvider is mounted above it
// (the public <FileExplorer> wrapper does that). Root div is h-full.
export function ExplorerView({
  initialPath,
  rootLabel = "Files",
  onOpenFile,
  className,
}: {
  initialPath?: string;
  rootLabel?: string;
  onOpenFile?: (path: string, entry: FsEntry) => void;
  className?: string;
}) {
  const fs = useFiles(initialPath);
  useAgentTools(fileExplorerTools, fs);
  const sel = useFileSelection(fs.entries);
  const cmd = useFileCommands(fs, sel, onOpenFile);
  const dnd = useDnd(sel.selected, sel.selectOne, fs.move, fs.upload);
  const win = useWindowDrop(dnd, fs.path);
  const uploadRef = useRef<FilePickerHandle>(null);
  const folderRef = useRef<FilePickerHandle>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("name");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ordered = useMemo(
    () => (fs.entries ? sortEntries(fs.entries, sort) : null),
    [fs.entries, sort],
  );
  const cutNames =
    fs.clip?.mode === "cut" && fs.clip.from === fs.path
      ? new Set(fs.clip.names)
      : new Set<string>();
  const selectedEntry =
    sel.selected.size === 1
      ? (fs.entries?.find((e) => sel.selected.has(e.name)) ?? null)
      : null;
  const openPicker = () => uploadRef.current?.open();
  const openFolderPicker = () => folderRef.current?.open();

  const sidebar = (
    <FilesSidebar
      path={fs.path}
      roots={fs.roots}
      usage={fs.usage}
      rootLabel={rootLabel}
      dropTarget={dnd.dropTarget}
      onNavigate={(p) => { cmd.go(p); setSidebarOpen(false); }}
      onOpenFile={(p) => { cmd.openPath(p); setSidebarOpen(false); }}
      onEmptyTrash={cmd.emptyTrash}
      onDragOver={dnd.onDragOver}
      onDragLeave={dnd.onDragLeave}
      onDrop={dnd.onDrop}
    />
  );

  return (
    <div
      className={cn("relative flex h-full outline-none", className)}
      tabIndex={0}
      onKeyDown={cmd.onKey}
      onDragOver={win.onDragOver}
      onDragLeave={win.onDragLeave}
      onDrop={win.onDrop}
    >
      {win.dragActive && <DropOverlay />}
      {/* Inline rail on wide screens; left Sheet drawer on narrow/mobile. */}
      <aside className="hidden w-60 shrink-0 border-r border-border md:flex">{sidebar}</aside>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Files</SheetTitle>
          <SheetDescription className="sr-only">
            Browse favorites, the file tree, and storage.
          </SheetDescription>
          {sidebar}
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <FilesToolbar
          path={fs.path}
          rootLabel={rootLabel}
          canBack={fs.canBack}
          canForward={fs.canForward}
          view={view}
          sort={sort}
          hasClipboard={!!fs.clip}
          onBack={() => { fs.goBack(); sel.clear(); }}
          onForward={() => { fs.goForward(); sel.clear(); }}
          onNavigate={cmd.go}
          onView={setView}
          onSort={setSort}
          onNewFolder={cmd.newFolder}
          onUpload={openPicker}
          onUploadFolder={openFolderPicker}
          onPaste={fs.paste}
          onOpenSidebar={() => setSidebarOpen(true)}
          dropTarget={dnd.dropTarget}
          onCrumbDragOver={dnd.onDragOver}
          onCrumbDragLeave={dnd.onDragLeave}
          onCrumbDrop={dnd.onDrop}
        />
        {fs.error && (
          <div className="border-b border-destructive/30 bg-destructive/10 px-3 py-1 text-[11px] text-destructive">
            {fs.error}
          </div>
        )}
        <ScrollArea
          className="flex-1"
          onClick={() => sel.clear()}
          onContextMenu={(e) => cmd.onContext(e, null)}
        >
          {ordered === null ? (
            <div className="flex h-full items-center justify-center gap-2 p-8 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : (
            <FileView
              entries={ordered}
              view={view}
              dir={fs.path}
              selected={sel.selected}
              cutNames={cutNames}
              renaming={cmd.renaming}
              dnd={dnd}
              onItemClick={sel.onItemClick}
              onOpen={cmd.open}
              onContext={cmd.onContext}
              onRename={cmd.doRename}
              onRenameCancel={() => cmd.setRenaming(null)}
            />
          )}
        </ScrollArea>
        <FileDetails entry={selectedEntry} dir={fs.path} />
        <FileStatusBar
          itemCount={ordered ? ordered.length : null}
          selectedCount={sel.selected.size}
          usage={fs.usage}
          clip={fs.clip}
        />
      </div>

      {cmd.ctx && (
        <FileContextMenu
          ctx={cmd.ctx}
          hasClipboard={!!fs.clip}
          inTrash={cmd.inTrash}
          onClose={() => cmd.setCtx(null)}
          onOpen={() => cmd.ctx?.entry && cmd.open(cmd.ctx.entry)}
          onRename={() => cmd.ctx?.entry && cmd.setRenaming(cmd.ctx.entry.name)}
          onNewFolder={cmd.newFolder}
          onUpload={openPicker}
          onUploadFolder={openFolderPicker}
          onCut={() => cmd.cut(cmd.targets())}
          onCopy={() => cmd.copy(cmd.targets())}
          onPaste={fs.paste}
          onDownload={() => fs.setError(null)}
          onDelete={() => cmd.del(cmd.targets())}
        />
      )}
      <UploadInput ref={uploadRef} onFiles={fs.upload} />
      <UploadInput ref={folderRef} onFiles={fs.upload} directory />
    </div>
  );
}
