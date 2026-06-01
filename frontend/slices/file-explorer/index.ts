// Public barrel — consumers import ONLY from here.
export { FileExplorer } from "./file-explorer";
export type { FileExplorerProps } from "./file-explorer";

// Adapter seam: the in-memory mock, the provider/hook, and all fs types.
export { createMockAdapter } from "./adapter/mock";
export { createLiveAdapter } from "./adapter/live";
export type { LiveAdapterOptions } from "./adapter/live";
export { createConvexAdapter } from "./adapter/convex";
export type { ConvexLike, FsFunctionRefs } from "./adapter/convex";
export { FileExplorerAdapterProvider, useFsAdapter } from "./adapter/context";
export type { FsApi } from "./adapter/context";

// The single backend switch (mock | live | convex). Edit lib/backend.ts (or set
// NEXT_PUBLIC_FILE_EXPLORER_BACKEND) to move the whole explorer to a real fs.
export { getFileExplorerAdapter, FILE_EXPLORER_BACKEND } from "./lib/backend";
export type { BackendKind } from "./lib/backend";
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
