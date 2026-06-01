// The single backend seam for the File Explorer. The slice ships NO backend
// coupling — a consumer wires a `FileExplorerAdapter` (host fs / S3 / Convex /
// the bundled in-memory mock) via `FileExplorerAdapterProvider`. Ported from
// the os-vps os-api `fs` contract, trimmed to the filesystem subset the
// explorer needs.

export type FsEntry = {
  name: string;
  kind: "dir" | "file";
  size: number;
  ext?: string;
  mime?: string;
};

export type FsRoot = { label: string; path: string };

export type FsList = {
  /** Canonical absolute path the backend resolved (e.g. "~" → "/home/user"). */
  path: string;
  entries: FsEntry[];
  /** Jump-point roots (Home, Projects, …) for the sidebar favorites. */
  roots?: FsRoot[];
  /** Parent dir within bounds, or null at a root. */
  parent?: string | null;
};

export type FsUsage = { used: number; total: number };

/** One upload item. `relPath` keeps folder structure (e.g. "imgs/a.png"); for a
 * loose file it's just the name. `file` carries the raw bytes. */
export type UploadFile = { relPath: string; file: File };

/** Per-request upload outcome: how many landed, and which relPaths were skipped. */
export type UploadResult = { written: number; failed?: string[] };

// The injectable backend. FLAT shape (`adapter.list`, not `adapter.fs.list`).
// `useFsAdapter()` re-wraps this as `{ mode, fs, rawUrl }` so the copied hooks
// keep calling `api.fs.list(...)` / `api.mode` unchanged (smallest diff).
export type FileExplorerAdapter = {
  /** "readonly" => mutations surface an inline notice instead of throwing. */
  mode: "mock" | "live" | "readonly";
  list: (path: string) => Promise<FsList>;
  mkdir: (path: string) => Promise<unknown>;
  remove: (path: string) => Promise<unknown>;
  move: (from: string, to: string) => Promise<unknown>;
  copy: (from: string, to: string) => Promise<unknown>;
  upload: (dest: string, files: UploadFile[]) => Promise<UploadResult>;
  usage: () => Promise<FsUsage>;
  /** Bytes URL for image/media thumbnails ("" when unavailable, e.g. mock). */
  rawUrl: (path: string) => string;
  /** Create an empty file (the tree's inline "new file" affordance). Optional;
   * adapters without write support simply omit it (the tree no-ops the create). */
  write?: (path: string, content: string) => Promise<unknown>;
};
