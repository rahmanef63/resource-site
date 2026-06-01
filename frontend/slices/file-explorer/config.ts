// Slice config export (rr: frontend.configExport = "fileExplorerConfig"). The
// explorer is backend-agnostic — the consumer injects a FileExplorerAdapter at
// the call site, so config here is purely cosmetic defaults.
export type FileExplorerConfig = {
  /** Default breadcrumb root label when the consumer omits `rootLabel`. */
  rootLabel: string;
  /** Default starting directory when the consumer omits `initialPath`. */
  initialPath: string;
};

export const fileExplorerConfig: FileExplorerConfig = {
  rootLabel: "Files",
  initialPath: "~",
};

export default fileExplorerConfig;
