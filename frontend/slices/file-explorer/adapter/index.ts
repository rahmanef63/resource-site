// Adapter barrel — the backend seam (replaces os-vps's os-api). Hooks and
// components import the adapter context + types from here.
export { FileExplorerAdapterProvider, useFsAdapter } from "./context";
export type { FsApi } from "./context";
export { createMockAdapter } from "./mock";
export type {
  FileExplorerAdapter,
  FsEntry,
  FsList,
  FsRoot,
  FsUsage,
  UploadFile,
  UploadResult,
} from "./types";
export type { Tree } from "./mock-tree";
