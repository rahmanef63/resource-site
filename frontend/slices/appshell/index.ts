// Public barrel — other slices/app layer import ONLY from here.
// Re-exported in domain groups (kept ≤200 LOC each):
//   ./index-core    — desktop/app mounting, registries, window store + hooks,
//                     widgets, app chrome and dialog primitives.
//   ./index-runtime — shell runtime services (toast, activity, commands, badges,
//                     layouts, recents, window mgmt, clipboard, share, lock, …)
//                     plus shared types and the os shell config.
//   ./index-shell   — responsive SSOT + primitives, the manifest-driven shell
//                     provider + registries, the multi-shell seam, the bundled
//                     shell features, and DEFAULT_FEATURES.
export * from "./index-core";
export * from "./index-runtime";
export * from "./index-shell";
// rr slice-specific surface upstream doesn't carry (dashboard shell, quicklink
// icon, app-chrome, form drawer, mock caps, widgets feature, config aliases).
export * from "./index-slice-extras";
