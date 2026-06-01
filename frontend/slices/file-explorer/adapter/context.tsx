"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { FileExplorerAdapter } from "./types";

// The shape the copied hooks/components consume. We wrap the flat adapter as
// `{ mode, fs, rawUrl }` so `api.fs.list(...)`, `api.mode`, and `api.rawUrl(...)`
// from the os-vps port keep working verbatim — the smallest possible diff.
export type FsApi = {
  mode: FileExplorerAdapter["mode"];
  fs: FileExplorerAdapter;
  rawUrl: FileExplorerAdapter["rawUrl"];
};

const Ctx = createContext<FsApi | null>(null);

export function FileExplorerAdapterProvider({
  adapter,
  children,
}: {
  adapter: FileExplorerAdapter;
  children: ReactNode;
}) {
  const value = useMemo<FsApi>(
    () => ({ mode: adapter.mode, fs: adapter, rawUrl: adapter.rawUrl }),
    [adapter],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFsAdapter(): FsApi {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useFsAdapter must be used within a FileExplorerAdapterProvider");
  return ctx;
}
