/**
 * Knowledge > Workspace Context Sub-Feature
 * 
 * Workspace-level context for AI understanding.
 * Currently in development.
 */

export interface WorkspaceContext {
  teamOverview?: string;
  projectContext?: string;
  goals?: string[];
  aiInstructions?: string;
  isAIAccessible: boolean;
}
