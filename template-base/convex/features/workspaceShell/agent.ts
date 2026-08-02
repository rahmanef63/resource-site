/**
 * workspace-shell — Convex agent stub (P0).
 *
 * Real agent tools (P3+) will expose: switchWorkspace, switchMenuSet,
 * forkMenuSet, listMenuSets, getNavContext for AI orchestration.
 */
export const workspaceShellAgent = {
  id: "workspace-shell",
  name: "Workspace Shell",
  description:
    "Manages atomic workspace + menu navigation context (NavContext primitive).",
  tools: [] as const,
}
