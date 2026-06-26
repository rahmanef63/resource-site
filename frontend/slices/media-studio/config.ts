// Slice config (rr: frontend.configExport = "mediaStudioConfig").
export type MediaStudioConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const mediaStudioConfig: MediaStudioConfig = {
  slug: "media-studio",
  title: "Media Studio — photo / social design canvas",
  category: "os",
};

export default mediaStudioConfig;
