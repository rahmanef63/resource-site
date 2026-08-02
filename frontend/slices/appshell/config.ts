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

// rr slice-registry metadata — gen-slice-registries.mjs spreads THIS into a
// RegisteredSlice (needs slug/title/category), which the runtime `config` above
// (osShellConfig — apps only) doesn't carry. Both live here because rr's slice
// generator and the OS runtime both key off @/features/appshell/config.
export type AppShellConfig = {
  slug: string;
  title: string;
  category: "os";
  apps: AppDescriptor[];
  wallpaperClassName?: string;
};

export const appshellConfig: AppShellConfig = {
  slug: "appshell",
  title: "AppShell — Desktop + Mobile OS Shell",
  category: "os",
  apps: [],
};
