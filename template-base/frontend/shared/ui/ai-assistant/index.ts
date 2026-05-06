/**
 * AI Assistant Components
 *
 * Feature-facing AI UI surface.
 *
 * - `FeatureShell` (frontend/shared/ui/layout/feature-shell) owns the
 *   embedded right-panel experience for feature pages.
 * - `FeatureAIAssistant` is the button that opens a dialog/drawer AI
 *   chat (used by the global site-header).
 * - `AIChatPanel` is the reusable chat surface for both.
 */

export { FeatureAIAssistant } from "./FeatureAIAssistant";
export type { FeatureAIAssistantProps } from "./FeatureAIAssistant";

export { AIChatPanel } from "./AIChatPanel";
export type { AIChatPanelProps } from "./AIChatPanel";
