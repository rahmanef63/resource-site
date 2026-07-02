// Slice public barrel — re-exports only.
export { default as StorePage } from "./page"

// Re-homed sub-views (formerly the deprecated `workspace-store` and `menus` slices).
// Store is the composition host: WorkspaceStorePage + MenuStorePage render as tabs.
export { WorkspaceStorePage } from "./views/workspace/WorkspaceStorePage"
export { default as MenuStorePage } from "./views/menu/MenuStorePage"
export type { MenuStorePageProps } from "./views/menu/MenuStorePage"
