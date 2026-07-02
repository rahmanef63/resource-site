/**
 * Overview Components
 * 
 * Modular components for the Overview feature.
 * Each section is a separate file for maintainability.
 */

// Section Components
export { StatsGrid, StatCard } from "./StatsGrid"
export type { StatsGridProps, StatCardProps } from "./StatsGrid"

export { RecentActivitySection } from "./RecentActivitySection"
export type { RecentActivitySectionProps, ActivityItem, ActivityType } from "./RecentActivitySection"

// New comprehensive sections
export { RecentItemsSection } from "./RecentItemsSection"
export type { RecentItemsSectionProps, RecentItem, RecentItemType } from "./RecentItemsSection"

export { UpcomingEventsSection } from "./UpcomingEventsSection"
export type { UpcomingEventsSectionProps, UpcomingEvent, EventUrgency } from "./UpcomingEventsSection"

// AIQuickChatSection removed 2026-04-20 — overview now uses shared
// AgentChatContainer directly. Quick prompts migrated to the overview agent's
// SubAgent.suggestions field in ./agent/index.ts (SSOT).

// Legacy (deprecated - use new sections instead)
// export * from "./QuickActionsSection" // Deprecated
// export type { QuickActionsSectionProps, QuickAction } from "./QuickActionsSection" // Deprecated

export { TimeRangeSelector } from "./TimeRangeSelector"
export type { TimeRangeSelectorProps, TimeRange } from "./TimeRangeSelector"

export { WorkspacesGrid, WorkspaceCard } from "./WorkspacesGrid"
export type { WorkspacesGridProps, WorkspaceItem, WorkspaceCardProps } from "./WorkspacesGrid"

export { TeamCompositionSection } from "./TeamCompositionSection"
export type { TeamCompositionSectionProps } from "./TeamCompositionSection"

export { OverviewSkeleton } from "./OverviewSkeleton"

export { PendingInvitationsSection } from "./PendingInvitationsSection"


