// Slice config (rr: frontend.configExport = "browserConfig").
export type BrowserConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** URL loaded by the Home action. */
  homeUrl: string;
};

export const browserConfig: BrowserConfig = {
  slug: "browser",
  title: "Browser — remote headless-browser chrome",
  category: "os",
  homeUrl: "https://en.wikipedia.org/wiki/Web_browser",
};

export default browserConfig;
