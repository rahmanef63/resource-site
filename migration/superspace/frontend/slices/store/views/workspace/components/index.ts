/**
 * Workspace Store Components Export
 */

export { WorkspaceCard } from "./WorkspaceCard"
export { WorkspaceTree } from "./WorkspaceTree"
export type { WorkspaceCardProps, WorkspaceTreeProps } from "../types"
export { PresetColorPicker as ColorPicker, InlineColorPicker } from "@/frontend/shared/ui/color-picker"
export { IconPicker, DynamicIcon as WorkspaceIcon, getIconComponent as getIconByName } from "@/frontend/shared/ui/icons"
export {
  CreateWorkspaceDialog,
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
  MoveWorkspaceDialog,
} from "./WorkspaceDialogs"
export { CreateWorkspaceAdvancedDialog } from "./CreateWorkspaceAdvancedDialog"
export { WorkspaceToolbar } from "./WorkspaceToolbar"
export { WorkspaceInspector } from "./WorkspaceInspector"
export { SaveAsTemplateDialog } from "./SaveAsTemplateDialog"
