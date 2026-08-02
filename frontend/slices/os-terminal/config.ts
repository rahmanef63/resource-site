// Slice config (rr: frontend.configExport = "osTerminalConfig").
export type OsTerminalConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** Prompt user@host label shown before the path. */
  promptLabel: string;
};

export const osTerminalConfig: OsTerminalConfig = {
  slug: "os-terminal",
  title: "Terminal — shell emulator with live passthrough + PTY seam",
  category: "os",
  promptLabel: "root@topside",
};

export default osTerminalConfig;
