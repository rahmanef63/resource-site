"use client";

import { useCallback, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { FsEntry } from "../adapter";
import { appForFile } from "../lib/icons";
import { joinPath, parentPath } from "../lib/format";
import { TRASH_PATH, type UseFiles } from "./use-files";
import type { UseFileSelection } from "./use-file-selection";
import type { ContextState } from "../lib/types";

// Opening a file is delegated to the consumer (os-vps routed it to its
// code-editor / media-viewer windows). If `onOpenFile` is undefined, opening a
// file is a no-op; folders always navigate.
export type OpenFileFn = (path: string, entry: FsEntry) => void;

// All user commands (open, clipboard, trash, keyboard) bound to the current fs
// + selection. Keeps the entry component focused on layout. `del` moves to Trash
// from a normal dir but hard-deletes (with confirm) when already inside Trash.
export function useFileCommands(
  fs: UseFiles,
  sel: UseFileSelection,
  onOpenFile?: OpenFileFn,
) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [ctx, setCtx] = useState<ContextState | null>(null);
  const inTrash = fs.path === TRASH_PATH;

  const go = useCallback(
    (path: string) => {
      fs.navigate(path);
      sel.clear();
    },
    [fs, sel],
  );

  const open = useCallback(
    (entry: FsEntry) => {
      if (entry.kind === "dir") return go(joinPath(fs.path, entry.name));
      onOpenFile?.(joinPath(fs.path, entry.name), entry);
    },
    [fs.path, go, onOpenFile],
  );

  // Open by absolute path (from the sidebar tree, which yields full paths).
  // Files with a known app type are handed to `onOpenFile`; unknown types just
  // navigate to the file's parent dir.
  const openPath = useCallback(
    (full: string) => {
      const name = full.split("/").filter(Boolean).pop() ?? "";
      const ext = name.includes(".") ? name.split(".").pop() : undefined;
      const entry: FsEntry = { name, kind: "file", size: 0, ext };
      if (!appForFile(entry)) return go(parentPath(full));
      onOpenFile?.(full, entry);
    },
    [go, onOpenFile],
  );

  const onContext = useCallback(
    (e: MouseEvent, entry: FsEntry | null) => {
      e.preventDefault();
      e.stopPropagation();
      if (entry && !sel.selected.has(entry.name)) sel.selectOne(entry.name);
      setCtx({ x: e.clientX, y: e.clientY, entry });
    },
    [sel],
  );

  const targets = useCallback(() => {
    if (!ctx?.entry) return [];
    return sel.selected.has(ctx.entry.name) ? [...sel.selected] : [ctx.entry.name];
  }, [ctx, sel.selected]);

  const cut = useCallback((names: string[]) => fs.setClip({ mode: "cut", names, from: fs.path }), [fs]);
  const copy = useCallback((names: string[]) => fs.setClip({ mode: "copy", names, from: fs.path }), [fs]);
  const del = useCallback(
    (names: string[]) => {
      if (inTrash) {
        if (!window.confirm(`Permanently delete ${names.length} item${names.length > 1 ? "s" : ""}?`)) return;
        fs.remove(names);
      } else {
        fs.trash(names);
      }
      sel.clear();
    },
    [fs, inTrash, sel],
  );
  const emptyTrash = useCallback(() => {
    if (window.confirm("Permanently delete all items in Trash?")) {
      fs.emptyTrash();
      sel.clear();
    }
  }, [fs, sel]);
  const doRename = useCallback(
    (from: string, to: string) => {
      setRenaming(null);
      if (!to.trim() || to === from) return; // no-op rename → skip the round-trip
      fs.rename(from, to);
    },
    [fs],
  );

  // New Folder → create, select, and drop straight into inline rename so the
  // user just types the name and hits Enter (one action, not three clicks).
  const newFolder = useCallback(async () => {
    const name = await fs.mkdir();
    sel.selectOne(name);
    setRenaming(name);
  }, [fs, sel]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (renaming) return;
      const mod = e.metaKey || e.ctrlKey;
      const names = [...sel.selected];
      if (mod && e.key === "a") {
        e.preventDefault();
        sel.selectAll();
      } else if (mod && e.key === "c" && names.length) copy(names);
      else if (mod && e.key === "x" && names.length) cut(names);
      else if (mod && e.key === "v") fs.paste();
      else if (e.key === "Enter" && names.length === 1) setRenaming(names[0]);
      else if ((e.key === "Backspace" || e.key === "Delete") && names.length) {
        e.preventDefault();
        del(names);
      } else if (e.key === "Escape") {
        sel.clear();
        fs.setClip(null);
      }
    },
    [copy, cut, del, fs, renaming, sel],
  );

  return {
    renaming, setRenaming, ctx, setCtx, inTrash,
    go, open, openPath, onContext, targets, cut, copy, del, emptyTrash, doRename, newFolder, onKey,
  };
}
