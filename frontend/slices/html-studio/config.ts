// Slice config (rr: frontend.configExport = "htmlStudioConfig").
export type HtmlStudioConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const htmlStudioConfig: HtmlStudioConfig = {
  slug: "html-studio",
  title: "HTML Studio — sandboxed HTML/CSS/JS editor with live preview",
  category: "os",
};

export default htmlStudioConfig;
