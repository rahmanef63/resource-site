// Legacy exports (backward compatible)
export { OnboardingFlow } from './components/OnboardingFlow';

// New robust onboarding
export { RobustOnboardingFlow } from './components/RobustOnboardingFlow';
export { BundleSelector } from './components/BundleSelector';
export { FeatureCustomizer } from './components/FeatureCustomizer';
export { OnboardingChecklistPanel } from './components/OnboardingChecklistPanel';
export { CreateWorkspaceDrawer } from './components/CreateWorkspaceDrawer';
export type { CreateWorkspaceDrawerProps } from './components/CreateWorkspaceDrawer';
export { CreateWorkspaceAdvancedDialog } from './components/CreateWorkspaceAdvancedDialog';
export type { CreateWorkspaceAdvancedDialogProps } from './components/CreateWorkspaceAdvancedDialog';
export { ImportWorkspacePanel } from './components/ImportWorkspacePanel';
export type { ImportWorkspacePanelProps } from './components/ImportWorkspacePanel';
export { JoinWorkspacePanel } from './components/JoinWorkspacePanel';
export type { JoinWorkspacePanelProps } from './components/JoinWorkspacePanel';
export {
  ImportAndJoinTabTriggers,
  ImportAndJoinTabContents,
  IMPORT_TAB_VALUE,
  JOIN_TAB_VALUE,
  IMPORT_TAB_LABEL,
  JOIN_TAB_LABEL,
} from './components/ImportAndJoinTabs';

// Bundle templates - All bundle-related exports
export {
  // Constants
  WORKSPACE_BUNDLES,
  BUNDLE_IDS,
  CORE_FEATURES,
  // Functions
  getAllBundles,
  getBundleById,
  getBundlesForWorkspaceType,
  getBundlesByCategory,
  getBundleEnabledFeatures,
  getBundleAllFeatures,
  getFeatureRoleInBundle,
  isFeatureInBundle,
  validateBundles,
  clearBundleCache,
} from './constants/bundles';
export type {
  BundleId,
  AvailableFeatureId,
  WorkspaceBundleTemplate,
} from './constants/bundles';

// Bundle hooks (database + static fallback)
export {
  usePublicBundles,
  useBundleWithFeatures,
  useBundlesForWorkspaceType,
  getMergedBundleEnabledFeatures,
  getMergedBundleAllFeatures,
} from './hooks/useBundles';
export type { MergedBundle } from './hooks/useBundles';

// Workspace ID helpers (canonical — consumed across slices)
export { useWorkspaceId, useWorkspaceIds } from './hooks/useWorkspaceId';

// Settings
export { WorkspaceSettings } from '@/frontend/shared/settings/workspace/WorkspaceSettings';
// Note: MemberManagementPanel moved to user-management feature
// If needed, import from: @/frontend/slices/user-management

// Types
export type {
  MemberManagementProps,
  WorkspaceSettingsProps,
  OnboardingFlowProps,
  OnboardingProgressProps,
  OnboardingProgressStep,
  OnboardingStepProps,
} from './components/types';
export type {
  ExtendedOnboardingData,
  ExtendedOnboardingFlowProps,
  ExtendedOnboardingStepProps,
  FeatureSelectionState,
  OnboardingStepDef,
} from './components/onboarding-types';
export type {
  WorkspaceMemberRoleSummary,
  WorkspaceMemberSummary,
  WorkspaceType,
  ViewType,
  WorkspaceNavigationItem,
  OnboardingData,
  OnboardingStepMeta,
  WorkspaceLayoutState,
} from './types';
