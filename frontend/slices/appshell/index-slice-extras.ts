// Slice-extras barrel — rr-specific public surface the upstream OS (rahmanef-com)
// index-core/runtime/shell don't carry, so the re-sync keeps THIS slice's older
// consumers compiling. Everything here is a name upstream dropped or renamed.
// ponytail: additive shim so `@/features/appshell` stays backward-compatible;
// fold into the split barrels if/when consumers migrate to the upstream names.

// Bundled single-pane cockpit shell (also self-registers as ShellId "dashboard").
export { DashboardShell } from "./components/shells/dashboard/dashboard-shell";
export { QuicklinkIcon } from "./components/quicklink-icon";
// Reusable app-window chrome (all regions optional).
export { AppHeader, AppSidebar, AppInspector } from "./components/layout/app-chrome";
// Form/preview drawer — dialog on desktop ⇄ bottom drawer on mobile.
export {
  ResponsiveDialog,
  ResponsiveDialog as FormDrawer,
} from "./primitives/responsive-dialog";
// Mock capabilities pack — drive all shell features with no backend.
export { mockCapabilities } from "./lib/mock-capabilities";
// rr slice-registry metadata (slug/title/category) — distinct from the runtime
// osShellConfig default; kept for this slice's catalog + generated registry.
export { appshellConfig } from "./config";
export type { AppShellConfig } from "./config";
// Home-screen widgets shell-feature (upstream dropped it in its branding pivot;
// this slice keeps the feature available, just not in DEFAULT_FEATURES).
export { widgetsFeature } from "./features/widgets";

// Quick-links capability — re-grafted into capabilities.tsx (upstream dropped it).
export { useQuickLinks } from "./registry/capabilities";
export type { QuickLink, QuickLinks } from "./registry/capabilities";
