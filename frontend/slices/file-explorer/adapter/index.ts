// Adapter barrel — the backend seam (replaces os-vps's os-api). Hooks and
// components import the adapter context + types from here.
export { FileExplorerAdapterProvider, useFsAdapter } from "./context";
export type { FsApi } from "./context";
export { createMockAdapter } from "./mock";
export { createLiveAdapter } from "./live";
export type { LiveAdapterOptions } from "./live";
export { createConvexAdapter } from "./convex";
export type { ConvexLike, FsFunctionRefs } from "./convex";
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
