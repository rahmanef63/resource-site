/**
 * Slice barrel — re-exports the canonical Knowledge components from the
 * slice's `shared/` directory so feature-preview / inspectors can import
 * via the sibling-slice path (`../components`) per the preview validator
 * contract.
 */

export { KnowledgeSidebar, KnowledgeView, KnowledgeViewTabs } from "../shared/components"
export { KnowledgeStatsCards } from "./KnowledgeStatsCards"
export type { KnowledgeStats, KnowledgeStatsCardsProps } from "./KnowledgeStatsCards"
