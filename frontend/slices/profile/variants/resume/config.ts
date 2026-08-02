// Slice config (rr: frontend.configExport = "resumeConfig").
export type ResumeConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const resumeConfig: ResumeConfig = {
  slug: "resume",
  title: "Resume — one-column CV renderer",
  category: "os",
};

export default resumeConfig;
