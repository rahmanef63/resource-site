"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFsAdapter, type FsEntry, type FsRoot, type FsUsage, type UploadFile } from "../adapter";
import { joinPath, uniqueName } from "../lib/format";
import { useFsHistory } from "./use-fs-history";
import type { Clipboard } from "../lib/types";

const READ_ONLY = "This backend is read-only";
export const TRASH_PATH = "/.Trash";

// All filesystem state + mutations for the explorer. Every mutation runs through
// `guard`, which surfaces a one-line inline notice (e.g. a read-only backend)
// instead of throwing, then reloads the current dir on success.
// Optional toast sink (upload progress). Threaded from the top component; when
// absent, upload still happens silently (the dir reload reflects the result).
export type ToastFn = (msg: string, tone?: "success") => void;

export function useFiles(initialPath?: string, onToast?: ToastFn) {
  const api = useFsAdapter();
  const start = initialPath || "~";
  const nav = useFsHistory(start);
  const path = nav.path;
  const [entries, setEntries] = useState<FsEntry[] | null>(null);
  const [roots, setRoots] = useState<FsRoot[]>([]);
  const [usage, setUsage] = useState<FsUsage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clip, setClip] = useState<Clipboard | null>(null);
  const reloadRef = useRef(0);
  const [reload, setReload] = useState(0);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    setEntries(null);
    api.fs
      .list(path)
      .then((res) => {
        if (!alive) return;
        setEntries(res.entries);
        if (res.roots?.length) setRoots(res.roots);
      })
      .catch(() => {
        if (alive) setEntries([]);
      });
    return () => {
      alive = false;
    };
  }, [api, path, reload]);

  useEffect(() => {
    let alive = true;
    api.fs.usage().then((u) => alive && setUsage(u)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [api, reload]);

  const guard = useCallback(
    async (run: () => Promise<unknown>) => {
      if (api.mode === "readonly") {
        setError(READ_ONLY);
        return;
      }
      setError(null);
      try {
        await run();
        reloadRef.current += 1;
        setReload((n) => n + 1);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      }
    },
    [api.mode],
  );

  const taken = useMemo(
    () => new Set((entries ?? []).map((e) => e.name)),
    [entries],
  );

  // Returns the created name so the caller can immediately select + rename it
  // (Finder-style: New Folder → type name → Enter, no extra clicks).
  const mkdir = useCallback(
    async (name = "untitled folder") => {
      const finalName = uniqueName(taken, name);
      await guard(() => api.fs.mkdir(joinPath(path, finalName)));
      return finalName;
    },
    [api, guard, path, taken],
  );
  // Upload files/folders (binary-safe) into `dest` (defaults to the current dir;
  // a drop onto a folder passes that folder's path). Structure is kept server-side.
  const upload = useCallback(
    (files: UploadFile[], dest: string = path) => {
      if (!files.length) return;
      const label = `${files.length} item${files.length > 1 ? "s" : ""}`;
      onToast?.(`Uploading ${label}…`);
      return guard(async () => {
        const res = await api.fs.upload(dest, files);
        const n = res && typeof res.written === "number" ? res.written : files.length;
        onToast?.(`Uploaded ${n} item${n === 1 ? "" : "s"}`, "success");
      });
    },
    [api, guard, path, onToast],
  );
  // Move a set of names from the current dir into `destPath` (drag-drop target).
  const move = useCallback(
    (names: string[], destPath: string) => {
      if (destPath === path) return Promise.resolve();
      return guard(async () => {
        const list = await api.fs.list(destPath);
        const seen = new Set(list.entries.map((e) => e.name));
        for (const name of names) {
          const to = uniqueName(seen, name);
          seen.add(to);
          await api.fs.move(joinPath(path, name), joinPath(destPath, to));
        }
      });
    },
    [api, guard, path],
  );
  // Move selected names into the Trash folder instead of hard-deleting.
  const trash = useCallback(
    (names: string[]) =>
      guard(async () => {
        const list = await api.fs.list(TRASH_PATH).catch(() => ({ entries: [] }));
        const seen = new Set(list.entries.map((e) => e.name));
        for (const name of names) {
          const to = uniqueName(seen, name);
          seen.add(to);
          await api.fs.move(joinPath(path, name), joinPath(TRASH_PATH, to));
        }
      }),
    [api, guard, path],
  );
  // Permanently remove everything currently in Trash.
  const emptyTrash = useCallback(
    () =>
      guard(async () => {
        const list = await api.fs.list(TRASH_PATH).catch(() => ({ entries: [] }));
        await Promise.all(
          list.entries.map((e) => api.fs.remove(joinPath(TRASH_PATH, e.name))),
        );
      }),
    [api, guard],
  );
  const rename = useCallback(
    (from: string, to: string) =>
      guard(() => api.fs.move(joinPath(path, from), joinPath(path, to))),
    [api, guard, path],
  );
  const remove = useCallback(
    (names: string[]) => guard(() => Promise.all(names.map((n) => api.fs.remove(joinPath(path, n))))),
    [api, guard, path],
  );
  const paste = useCallback(() => {
    if (!clip) return;
    const op = clip.mode === "cut" ? api.fs.move : api.fs.copy;
    return guard(async () => {
      for (const name of clip.names) {
        await op(joinPath(clip.from, name), joinPath(path, uniqueName(taken, name)));
      }
      setClip(null);
    });
  }, [api, clip, guard, path, taken]);

  return {
    api,
    path,
    entries,
    roots,
    usage,
    error,
    clip,
    canBack: nav.canBack,
    canForward: nav.canForward,
    setError,
    setClip,
    navigate: nav.navigate,
    goBack: nav.goBack,
    goForward: nav.goForward,
    refresh,
    mkdir,
    upload,
    move,
    trash,
    emptyTrash,
    rename,
    remove,
    paste,
  };
}

export type UseFiles = ReturnType<typeof useFiles>;
