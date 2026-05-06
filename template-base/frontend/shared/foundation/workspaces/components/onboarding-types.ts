/**
 * Extended Onboarding Types
 *
 * Types for the robust onboarding flow with bundle selection
 */

import type { Id } from "@convex/_generated/dataModel"
import type { WorkspaceType } from "../types"
import type { AvailableFeatureId, WorkspaceBundleTemplate } from "@/frontend/shared/foundation/workspaces/constants/bundles"

/**
 * Extended Onboarding Data with bundle selection
 */
export interface ExtendedOnboardingData {
  // Step 1: Basic Info
  name: string
  type: WorkspaceType
  description: string
  
  // Step 2: Bundle Selection
  selectedBundleId: string | null
  
  // Step 3: Feature Customization
  enabledFeatures: AvailableFeatureId[]
  disabledFeatures: AvailableFeatureId[]
}

/**
 * Onboarding Step Definition
 */
export interface OnboardingStepDef {
  id: string
  label: string
  title: string
  description: string
  icon?: string
}

/**
 * Feature Selection State
 */
export interface FeatureSelectionState {
  featureId: AvailableFeatureId
  enabled: boolean
  isCore: boolean // Cannot be disabled
  isRecommended: boolean
}

/**
 * Bundle Card Props
 */
export interface BundleCardProps {
  bundle: WorkspaceBundleTemplate
  isSelected: boolean
  onSelect: () => void
}

/**
 * Feature Toggle Props
 */
export interface FeatureToggleProps {
  feature: FeatureSelectionState
  featureName: string
  featureDescription: string
  icon: string
  onToggle: () => void
}

/**
 * Onboarding Flow Props (Extended)
 */
export interface ExtendedOnboardingFlowProps {
  onComplete: (workspaceId: Id<"workspaces">, enabledFeatures: AvailableFeatureId[]) => void
  variant?: "page" | "dialog"
  initialType?: WorkspaceType
}

/**
 * Onboarding Step Props (Extended)
 */
export interface ExtendedOnboardingStepProps {
  step: number
  stepDef: OnboardingStepDef
  data: ExtendedOnboardingData
  onDataChange: (data: ExtendedOnboardingData) => void
  onNext: () => void
  onBack: () => void
  onComplete: () => void
  isLastStep: boolean
  isFirstStep: boolean
  isSubmitting?: boolean
  errorMessage?: string | null
}
