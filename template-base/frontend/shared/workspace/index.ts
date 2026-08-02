/**
 * Canonical workspace platform surface used by shared app shell code.
 */

export * from "./types";
export * from "./constants";
export {
  ColorPicker,
  InlineColorPicker,
  WorkspaceColorPicker,
  InlineWorkspaceColorPicker,
} from "./components/ColorPicker";
export { IconPicker, WorkspaceIcon, DynamicIcon, getIconByName } from "./components/IconPicker";
export {
  CreateWorkspaceDialog,
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
  MoveWorkspaceDialog,
} from "./components/WorkspaceDialogs";
