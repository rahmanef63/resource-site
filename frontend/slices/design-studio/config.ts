// Slice config (rr: frontend.configExport = "designStudioConfig").
export type DesignStudioConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const designStudioConfig: DesignStudioConfig = {
  slug: "design-studio",
  title: "Design Studio — photo / social design canvas",
  category: "os",
};

export default designStudioConfig;
