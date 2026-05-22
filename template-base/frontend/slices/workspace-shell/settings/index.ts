/**
 * workspace-shell — settings (P0 stub).
 *
 * Real settings UI lands in P4 (default menuSet per workspace, fork policy,
 * tree presentation options). For now exports a placeholder.
 */
export function WorkspaceShellSettings() {
  return null
}

export const DEFAULT_WORKSPACE_SHELL_SETTINGS = {
  defaultMenuSetSlug: "default",
  allowUserFork: true,
  showWorkspaceTree: true,
} as const
