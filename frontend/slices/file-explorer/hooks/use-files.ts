"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFsAdapter, type FsEntry, type FsRoot, type FsUsage } from "../adapter";
import { friendly } from "../lib/errors";
import { useFsHistory } from "./use-fs-history";
import { useFileOps, type ToastFn } from "./use-file-ops";
import type { Clipboard } from "../lib/types";

export { TRASH_PATH } from "./use-file-ops";
export type { ToastFn } from "./use-file-ops";

const READ_ONLY = "This backend is read-only";

// All filesystem state + mutations for the explorer. Every mutation runs through
// `guard`, which surfaces a one-line inline notice (e.g. a read-only backend)
// instead of throwing, then reloads the current dir on success. Navigation
// history lives in `useFsHistory`; the mutations themselves in `useFileOps`.
export function useFiles(initialPath?: string, onToast?: ToastFn) {
  const api = useFsAdapter();
  const nav = useFsHistory(initialPath || "~");
  const { path } = nav;
  // Listing keyed by the request that produced it: when path/reload move on, the
  // stale result stops matching and `entries` derives back to null (loading) —
  // no synchronous setState reset in the effect (react-hooks/set-state-in-effect).
  const [listing, setListing] = useState<{ key: string; entries: FsEntry[] } | null>(null);
  const [roots, setRoots] = useState<FsRoot[]>([]);
  const [usage, setUsage] = useState<FsUsage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clip, setClip] = useState<Clipboard | null>(null);
  const reloadRef = useRef(0);
  const [reload, setReload] = useState(0);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const loadKey = `${path} ${reload}`;
  const entries = listing?.key === loadKey ? listing.entries : null;

  useEffect(() => {
    let alive = true;
    api.fs
      .list(path)
      .then((res) => {
        if (!alive) return;
        setListing({ key: loadKey, entries: res.entries });
        if (res.roots?.length) setRoots(res.roots);
      })
      .catch(() => {
        if (alive) setListing({ key: loadKey, entries: [] });
      });
    return () => {
      alive = false;
    };
  }, [api, path, loadKey]);

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
        setError(friendly(msg));
      }
    },
    [api.mode],
  );

  const taken = useMemo(
    () => new Set((entries ?? []).map((e) => e.name)),
    [entries],
  );

  const ops = useFileOps({ api, guard, path, taken, clip, setClip, onToast });

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
    ...ops,
  };
}

export type UseFiles = ReturnType<typeof useFiles>;
