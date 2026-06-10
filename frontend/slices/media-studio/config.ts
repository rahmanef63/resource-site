// Slice config (rr: frontend.configExport = "mediaStudioConfig").
export type MediaStudioConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** Canvas zoom bounds (%). */
  zoomMin: number;
  zoomMax: number;
  /** Debounce window for coalescing undo steps (ms). */
  undoDebounceMs: number;
};

export const mediaStudioConfig: MediaStudioConfig = {
  slug: "media-studio",
  title: "Media Studio — photo / social design canvas",
  category: "os",
  zoomMin: 50,
  zoomMax: 200,
  undoDebounceMs: 400,
};

export default mediaStudioConfig;
