/**
 * Feature Preview System Types
 * 
 * Types for the feature preview system that displays
 * mock previews of features in workspace-store and menu-store
 */

import type { ReactNode, ComponentType } from 'react'

/**
 * Mock data structure for a feature preview
 */
export interface FeaturePreviewMockData {
  /** Unique identifier for this mock data set */
  id: string
  /** Display name for the mock scenario */
  name: string
  /** Description of what this mock shows */
  description?: string
  /** The actual mock data - use unknown for flexible typing */
  data: unknown
}

/**
 * Configuration for a feature preview
 */
export interface FeaturePreviewConfig {
  /** Feature ID this preview is for */
  featureId: string
  /** Display name */
  name: string
  /** Short description */
  description: string
  /** Preview component */
  component: ComponentType<FeaturePreviewProps>
  /** Available mock data scenarios */
  mockDataSets: FeaturePreviewMockData[]
  /** Default mock data set ID */
  defaultMockDataId?: string
  /** Preview thumbnail/screenshot URL (optional) */
  thumbnailUrl?: string
  /** Feature category for grouping */
  category: FeaturePreviewCategory
  /** Tags for filtering */
  tags?: string[]
}

/**
 * Alias for FeaturePreviewConfig (used by defineFeaturePreview)
 */
export type FeaturePreviewDefinition = FeaturePreviewConfig

/**
 * Props passed to feature preview components
 */
export interface FeaturePreviewProps {
  /** Current mock data being displayed */
  mockData: FeaturePreviewMockData
  /** Whether preview is in compact mode */
  compact?: boolean
  /** Whether to show interactive elements */
  interactive?: boolean
  /** Callback when user interacts with preview */
  onInteraction?: (action: string, data?: unknown) => void
}

/**
 * Feature preview categories
 */
export type FeaturePreviewCategory =
  | 'communication'
  | 'productivity'
  | 'collaboration'
  | 'administration'
  | 'social'
  | 'creativity'
  | 'analytics'
  | 'content'
  | 'insights'
  | 'team'
  | 'profile'
  | 'business'
  | 'finance'
  | 'inventory'
  | 'operations'

/**
 * State for the preview panel
 */
export interface FeaturePreviewPanelState {
  /** Currently selected feature ID */
  selectedFeatureId: string | null
  /** Current mock data set ID */
  currentMockDataId: string | null
  /** Whether panel is expanded */
  isExpanded: boolean
  /** Interactive mode */
  isInteractive: boolean
}

/**
 * Feature list item for the middle panel
 */
export interface FeatureListItem {
  id: string
  name: string
  description: string
  icon: string
  category: FeaturePreviewCategory
  isInstalled: boolean
  isEnabled: boolean
  hasPreview: boolean
  tags?: string[]
}

/**
 * Props for the feature list panel (middle panel)
 */
export interface FeatureListPanelProps {
  /** List of features to display */
  features: FeatureListItem[]
  /** Currently selected feature ID */
  selectedFeatureId: string | null
  /** Callback when feature is selected */
  onSelectFeature: (featureId: string) => void
  /** Callback when preview button is clicked */
  onPreviewFeature: (featureId: string) => void
  /** Search query */
  searchQuery?: string
  /** Filter by category */
  categoryFilter?: FeaturePreviewCategory | null
  /** Loading state */
  isLoading?: boolean
}

/**
 * Props for the preview panel (right panel)
 */
export interface PreviewPanelProps {
  /** Feature being previewed */
  featureId: string | null
  /** Preview configuration */
  previewConfig: FeaturePreviewConfig | null
  /** Current mock data */
  mockData: FeaturePreviewMockData | null
  /** Available mock data sets */
  mockDataSets: FeaturePreviewMockData[]
  /** Callback to change mock data */
  onChangeMockData: (mockDataId: string) => void
  /** Whether panel is visible */
  isVisible: boolean
  /** Callback to close panel */
  onClose: () => void
}
