// Slice config (rr: frontend.configExport = "mediaViewerConfig").
export type MediaViewerConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const mediaViewerConfig: MediaViewerConfig = {
  slug: "media-viewer",
  title: "Preview — media quick-look",
  category: "os",
};

export default mediaViewerConfig;
