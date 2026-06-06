// Slice config (rr: frontend.configExport = "imageEditorConfig"). Cosmetic
// defaults only — the editor takes its real input via <ImageEditor> props.
export type ImageEditorConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** Default blank-canvas size when no initialImage is given. */
  defaultWidth: number;
  defaultHeight: number;
  /** Default export format. */
  exportFormat: "png" | "jpeg" | "webp";
};

export const imageEditorConfig: ImageEditorConfig = {
  slug: "image-editor",
  title: "Image Editor — layered raster editor",
  category: "os",
  defaultWidth: 1080,
  defaultHeight: 1080,
  exportFormat: "png",
};

export default imageEditorConfig;
