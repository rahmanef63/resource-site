"use client";
/* Floating layers rendered above the explorer body: the right-click context
   menu, the preview lightbox, and the Properties editor. Split out of
   explorer-view so that file stays small; all state still lives in the parent. */
import { joinPath } from "../lib/format";
import type { FsEntry } from "../adapter";
import { FileContextMenu } from "./file-context-menu";
import { FilePreview } from "./file-preview";
import { FileProperties } from "./file-properties";
import type { UseFiles } from "../hooks/use-files";
import type { useFileCommands } from "../hooks/use-file-commands";

type Modal = { path: string; entry: FsEntry } | null;

export function ExplorerOverlays({
  fs,
  cmd,
  openPicker,
  openFolderPicker,
  preview,
  properties,
  closePreview,
  closeProperties,
  openProperties,
}: {
  fs: UseFiles;
  cmd: ReturnType<typeof useFileCommands>;
  openPicker: () => void;
  openFolderPicker: () => void;
  preview: Modal;
  properties: Modal;
  closePreview: () => void;
  closeProperties: () => void;
  openProperties: (path: string, entry: FsEntry) => void;
}) {
  return (
    <>
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
          onDownload={() => cmd.ctx?.entry && cmd.download(cmd.ctx.entry)}
          onProperties={() =>
            cmd.ctx?.entry &&
            openProperties(joinPath(fs.path, cmd.ctx.entry.name), cmd.ctx.entry)
          }
          onDelete={() => cmd.del(cmd.targets())}
        />
      )}
      {preview && <FilePreview path={preview.path} entry={preview.entry} onClose={closePreview} />}
      {properties && (
        <FileProperties
          path={properties.path}
          entry={properties.entry}
          onClose={closeProperties}
          onSaved={fs.refresh}
        />
      )}
    </>
  );
}
