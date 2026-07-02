/**
 * Backward-compat re-export. Canonical implementation lives in
 * `frontend/shared/foundation/workspaces/components/CreateWorkspaceAdvancedDialog.tsx`
 * so every create-workspace surface (workspace store, sidebar drawer,
 * app sidebar child-create) uses the same 5-tab dialog.
 */
export {
  CreateWorkspaceAdvancedDialog,
  type CreateWorkspaceAdvancedDialogProps,
} from "@/frontend/shared/foundation/workspaces/components/CreateWorkspaceAdvancedDialog"
