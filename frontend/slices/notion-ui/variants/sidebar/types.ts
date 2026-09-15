import type { ReactNode } from "react";
import type { NotionSidebarPage, FlatPage } from "./lib/types-core";
export type { NotionSidebarPage, FlatPage } from "./lib/types-core";

export interface NotionSidebarProps {
  pages: NotionSidebarPage[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onCreate?: (parentId: string | null) => void;
  onRename?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  /** Drag-reorder / reparent. `beforeId` is the sibling the dragged page is
   *  dropped in front of (null = append to the new parent's children). */
  onMove?: (id: string, parentId: string | null, beforeId: string | null) => void;
  className?: string;
  /** Header label above the tree. */
  label?: string;
  /** Display-only icon renderer per row (e.g. `@/features/icon-picker`'s
   *  DynamicIcon). Default renders the icon string as text (emoji). */
  renderIcon?: (icon: string, className?: string) => ReactNode;
  /** Optional icon PICKER wrapper — wrap the row icon so clicking it opens a
   *  picker (e.g. `@/features/icon-picker`'s IconPickerPopover). When omitted,
   *  the icon is display-only. */
  renderIconPicker?: (args: {
    value: string;
    onChange: (next: string) => void;
    children: ReactNode;
  }) => ReactNode;
  /** Called when a row's icon is changed via the picker. */
  onIconChange?: (id: string, icon: string) => void;
}
