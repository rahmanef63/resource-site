// Slice config (rr: frontend.configExport = "osTerminalConfig").
export type OsTerminalConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "ui";
  /** Prompt user@host label shown before the path. */
  promptLabel: string;
};

export const osTerminalConfig: OsTerminalConfig = {
  slug: "os-terminal",
  title: "Terminal — shell emulator with live passthrough",
  category: "ui",
  promptLabel: "root@topside",
};

export default osTerminalConfig;
