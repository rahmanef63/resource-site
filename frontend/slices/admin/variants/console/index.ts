export { AdminConsole, type AdminConsoleProps } from "./components/AdminConsole"
export { AccessGate } from "./components/AccessGate"
export { AnalyticsDashboard } from "./components/sections/AnalyticsDashboard"
export { AuditLogViewer } from "./components/sections/AuditLogViewer"
export { NavConfigManager } from "./components/sections/NavConfigManager"
export { LeadsInbox } from "./components/sections/LeadsInbox"
export { SeoHealthPanel } from "./components/sections/SeoHealthPanel"
export { useAdminSection } from "./hooks/useAdminSection"
export {
  ADMIN_CONSOLE_SECTIONS,
  SECTION_PROVIDERS,
  ALL_TIERS,
  type AdminConsoleSection,
  type AdminAccess,
  type AdminAccessLevel,
  type AdminTier,
  type OwnedSectionId,
} from "./lib/sections"
export { canSeeAdmin, canSeeSection, filterSections, hasPermission, meetsLevel } from "./lib/access"
export * from "./lib/mock"
