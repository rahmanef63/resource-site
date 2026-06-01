// Public barrel — consumers import ONLY from here.
export { FileExplorer } from "./file-explorer";
export type { FileExplorerProps } from "./file-explorer";

// Adapter seam: the in-memory mock, the provider/hook, and all fs types.
export { createMockAdapter } from "./adapter/mock";
export { FileExplorerAdapterProvider, useFsAdapter } from "./adapter/context";
export type { FsApi } from "./adapter/context";
export type {
  FileExplorerAdapter,
  FsEntry,
  FsList,
  FsRoot,
  FsUsage,
  UploadFile,
  UploadResult,
} from "./adapter/types";
export type { Tree } from "./adapter/mock-tree";

export { fileExplorerConfig } from "./config";
export type { FileExplorerConfig } from "./config";
