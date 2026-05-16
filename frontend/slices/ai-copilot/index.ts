/**
 * ai-copilot slice — public barrel.
 *
 * Sidebar AI companion for existing CRUD apps. Wrap pages with
 * `<CopilotProvider>` so the panel can read the focused entity, then
 * mount `<CopilotPanel />` anywhere in the shell.
 *
 *   import { CopilotProvider, CopilotPanel, useCopilot } from "@/features/ai-copilot";
 *
 * Status: scaffold (0.1.0). Real impl pending. UX target at
 * /preview/slices/ai-copilot.
 */

export type {
  EntityKind, EntityContext, CopilotSuggestion,
  CopilotTrigger, CopilotBindings,
} from "./types";
