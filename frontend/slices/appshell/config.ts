// Slice config export (rr: frontend.configExport = "default"). os-shell is the
// host surface; it declares no apps of its own — the app layer injects them.
import type { AppDescriptor } from "./lib/types";

export type OsShellConfig = {
  /** Apps mounted into the desktop. Wired by the consumer app layer. */
  apps: AppDescriptor[];
  /** Optional wallpaper class override (theme token based). */
  wallpaperClassName?: string;
};

const config: OsShellConfig = {
  apps: [],
};

export default config;
