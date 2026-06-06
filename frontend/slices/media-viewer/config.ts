// Slice config (rr: frontend.configExport = "mediaViewerConfig").
export type MediaViewerConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "ui";
  /** Zoom bounds for the image stage. */
  zoomMin: number;
  zoomMax: number;
};

export const mediaViewerConfig: MediaViewerConfig = {
  slug: "media-viewer",
  title: "Preview — media quick-look",
  category: "ui",
  zoomMin: 0.4,
  zoomMax: 3,
};

export default mediaViewerConfig;
