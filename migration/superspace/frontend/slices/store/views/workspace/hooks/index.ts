/**
 * Workspace Store Hooks
 */

export { 
  useWorkspaceStoreData,
  useWorkspaceTree,
  useFilteredWorkspaces,
  useWorkspaceById,
  useWorkspaceChildren,
  useWorkspaceSiblings,
  useWorkspaceAncestors,
} from "./useWorkspaceStoreData"

export { useWorkspaceStoreMutations } from "./useWorkspaceStoreMutations"

export {
  useWorkspaceStoreState,
  useWorkspaceDnDState,
  useWorkspaceDialogs,
} from "./useWorkspaceStoreState"

export {
  useTemplates,
  useTemplateById,
  useFeaturedTemplates,
  usePopularTemplates,
  useCategories,
  useInstallTemplate,
  useTemplateReviews,
  categoryMetadata,
  featureModules,
  hasIndustryTemplatesQueryApi,
} from "@/frontend/shared/foundation/workspaces/lib/useIndustryTemplates"
export type { IndustryCategory, FeatureModule, InstallOptions } from "@/frontend/shared/foundation/workspaces/lib/useIndustryTemplates"
