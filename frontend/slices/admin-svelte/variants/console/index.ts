export { default as AdminConsole } from "./components/AdminConsole.svelte";
export { default as AccessGate } from "./components/AccessGate.svelte";
export { default as AnalyticsDashboard } from "./components/sections/AnalyticsDashboard.svelte";
export { default as AuditLogViewer } from "./components/sections/AuditLogViewer.svelte";
export { default as LeadsInbox } from "./components/sections/LeadsInbox.svelte";
export { default as NavConfigManager } from "./components/sections/NavConfigManager.svelte";
export { default as SeoHealthPanel } from "./components/sections/SeoHealthPanel.svelte";
export { ADMIN_CONSOLE_SECTIONS, SECTION_PROVIDERS } from "@/features/admin/variants/console/lib/sections";
export type {
  AdminAccess,
  AdminAccessLevel,
  AdminConsoleSection,
  AdminTier,
} from "@/features/admin/variants/console/lib/sections";
export {
  canSeeAdmin,
  canSeeSection,
  filterSections,
  hasPermission,
  meetsLevel,
} from "@/features/admin/variants/console/lib/access";
export {
  ADMIN_SECTION_PARAM,
  groupSections,
  normalizeActiveSection,
  readSectionFromSearch,
  sectionHref,
  visibleSectionIds,
} from "@/features/admin/variants/console/lib/section-core";
export * from "@/features/admin/variants/console/lib/mock";
