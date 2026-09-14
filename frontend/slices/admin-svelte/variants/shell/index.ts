export { default as AdminPage } from "./components/AdminPage.svelte";
export {
  DEFAULT_ADMIN_LABELS,
  resolveAdminLabels,
  type SliceAdminLabels,
} from "@/features/admin/variants/shell/lib/registry-labels";
export {
  buildAdminStats,
  deriveCountTables,
  pickTitle,
} from "@/features/admin/variants/shell/lib/registry-stats";
export type {
  AdminCountTableReader,
  AdminStats,
  AdminTableRow,
  BuildAdminStatsOpts,
  SliceAdminActivityEntry,
  SliceRegistryAdapter,
} from "@/features/admin/variants/shell/lib/registry-types";
